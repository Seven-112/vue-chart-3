import type { Chart, ChartData, ChartDataset, ChartOptions, ChartType, Plugin } from 'chart.js';
import * as Chartjs from 'chart.js';
import { cloneDeep, isEqual } from 'lodash-es';
import {
  ComponentOptionsMixin,
  ComputedOptions,
  defineComponent,
  DefineComponent,
  h,
  MethodOptions,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  shallowRef,
  watch,
} from 'vue';
import { ChartComponentEmits } from '.';
import type { StyleValue } from '../misc';
import pascalCase from 'pascalcase';
import type { ChartPropsOptions, ComponentData } from './component.types';

/** Builder method to create a component based on Chart.js chart type
 *
 * @param chartName the id of the chart component
 * @param chartType the Chart.js chart type to use
 *
 * @example
 *
 * ```ts
 *  const MatrixChart = defineChartComponent('matrix-chart', 'matrix');
 * ```
 */
export const defineChartComponent = <TType extends ChartType = ChartType>(
  chartName: string,
  chartType: TType
): DefineComponent<
  ChartPropsOptions<TType>,
  ComponentData<TType>,
  unknown,
  ComputedOptions,
  MethodOptions,
  ComponentOptionsMixin,
  ComponentOptionsMixin,
  ChartComponentEmits<TType>
> => {
  const propsDefs: ChartPropsOptions<TType> = {
    chartData: { type: Object as PropType<ChartData<TType>>, required: true },
    options: { type: Object as PropType<Record<string, any>>, required: false },
    chartId: { default: chartName, type: String },
    width: { default: 400, type: Number },
    height: { default: 400, type: Number },
    cssClasses: { type: String, default: '' },
    styles: { type: Object as PropType<StyleValue> },
    plugins: { type: Array as PropType<Plugin[]>, default: () => [] },
    onLabelsUpdate: { type: Function as PropType<() => void> },
    onChartUpdate: { type: Function as PropType<(chartInstance: Chart<TType>) => void> },
    onChartDestroy: { type: Function as PropType<() => void> },
    onChartRender: { type: Function as PropType<(chartInstance: Chart<TType>) => void> },
  };

  const componentName = pascalCase(chartName);

  return defineComponent({
    name: componentName,
    props: propsDefs,
    emits: {
      'labels:update': () => true,
      'chart:update': (chartInstance: Chart<TType>) => true,
      'chart:destroy': () => true,
      'chart:render': (chartInstance: Chart<TType>) => true,
    } as ChartComponentEmits<TType>,
    setup(props, { emit, expose }) {
      const canvasRef = ref<HTMLCanvasElement | null>(null);

      const canvasId = `${props.chartId}`;

      let chartInstance = shallowRef<Chart<TType> | null>(null);

      watch(() => props.chartData, watchHandler, { deep: true });
      watch(
        () => props.options,
        (newOptions, oldOptions) => {
          if (
            chartInstance.value &&
            newOptions &&
            !isEqual(chartInstance.value.options, oldOptions)
          ) {
            chartInstance.value.options = cloneDeep(newOptions) as any;
            oldOptions = cloneDeep(newOptions) as any;
            handleChartUpdate();
          }
        },
        { deep: true }
      );

      /** Picked from vue-chartjs */
      function watchHandler(newData: ChartData<TType>, oldData: ChartData<TType>) {
        if (oldData && chartInstance.value) {
          let chart = chartInstance.value;

          // Check if Labels are equal and if dataset length is equal
          if (!isEqual(newData, oldData) && oldData.datasets.length === newData.datasets.length) {
            newData.datasets.forEach((dataset, i) => {
              // Get new and old dataset keys
              const oldDatasetKeys = Object.keys(oldData.datasets[i]);
              const newDatasetKeys = Object.keys(dataset);

              // Get keys that aren't present in the new data
              const deletionKeys = oldDatasetKeys.filter((key) => {
                return key !== '_meta' && newDatasetKeys.indexOf(key) === -1;
              });

              // Remove outdated key-value pairs
              deletionKeys.forEach((deletionKey) => {
                if (chart.data.datasets[i]) {
                  delete chart.data.datasets[i][deletionKey as keyof ChartDataset];
                }
              });

              // Update attributes individually to avoid re-rendering the entire chart
              for (const attribute in dataset) {
                const attrValue = dataset[attribute as keyof ChartDataset];
                if (dataset.hasOwnProperty(attribute) && attrValue != null && chart) {
                  (chart.data as any).datasets[i][attribute] = attrValue;
                }
              }
            });

            if (newData.labels) {
              chart.data.labels = newData.labels;
              handleLabelsUpdate();
            }
          } else {
            chart.data.datasets = newData.datasets;
          }

          handleChartUpdate();
        } else {
          if (chartInstance.value) {
            handleChartDestroy();
          }
          renderChart();
        }
      }

      function renderChart() {
        if (canvasRef.value) {
          chartInstance.value = new Chartjs.Chart(canvasRef.value as HTMLCanvasElement, {
            data: props.chartData,
            type: chartType,
            options: cloneDeep(props.options) as ChartOptions<TType>, // Types won't work with props type
            plugins: props.plugins,
          });
          handleChartRender();
        } else {
          console.error(
            `Error on component ${componentName}, canvas cannot be rendered. Check if the render appends server-side`
          );
        }
      }

      function handleLabelsUpdate() {
        emit('labels:update');
        props.onLabelsUpdate && props.onLabelsUpdate();
      }

      function handleChartRender() {
        if (chartInstance.value) {
          emit('chart:render', chartInstance.value);
          props.onChartRender && props.onChartRender(chartInstance.value);
        }
      }

      function handleChartUpdate() {
        if (chartInstance.value) {
          chartInstance.value.update();
          emit('chart:render', chartInstance.value);
          props.onChartRender && props.onChartRender(chartInstance.value);
        }
      }

      function handleChartDestroy() {
        chartInstance.value && chartInstance.value.destroy();
        emit('chart:destroy');
        props.onChartDestroy && props.onChartDestroy();
      }

      //- Hooks

      onMounted(renderChart);

      onBeforeUnmount(() => {
        if (chartInstance.value) {
          chartInstance.value.destroy();
        }
      });

      expose({
        canvasRef,
        renderChart,
        chartInstance,
        canvasId,
        update: handleChartUpdate,
      } as const);

      return () =>
        h(
          'div',
          {
            style: {
              maxWidth: '100%',
              ...(props.styles as any),
              position: 'relative',
            },
            class: props.cssClasses,
          },
          [
            h('canvas', {
              style: {
                maxWidth: '100%',
                maxHeight: '100%',
              },
              id: canvasId,
              width: props.width,
              height: props.height,
              ref: canvasRef,
            }),
          ]
        );
    },
  }) as any;
};
