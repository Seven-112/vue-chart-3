import { mount } from '@vue/test-utils';
import { DoughnutChart, BarChart, useBarChart } from '../packages/vue-chart-3/src';
import { Chart, DoughnutController, ArcElement, Legend, Title, Tooltip } from 'chart.js';
import Vue from 'vue';
import VueCompositionApi, { defineComponent, ref, computed } from '@vue/composition-api';

Vue.use(VueCompositionApi);
Chart.register(DoughnutController, ArcElement, Legend, Title, Tooltip);

describe('Vue 2 - Doughtnut chart', () => {
  beforeEach(() => {
    spyOn(console, 'error');
  });

  const { vm } = mount(DoughnutChart, {
    propsData: {
      chartData: {
        labels: ['Paris', 'Nîmes', 'Toulon', 'Perpignan', 'Autre'],
        datasets: [
          {
            data: [30, 40, 60, 70, 5],
            backgroundColor: ['#77CEFF', '#0079AF', '#123E6B', '#97B0C4', '#A5C8ED'],
          },
        ],
      },
      options: {
        scales: {
          myScale: {
            type: 'logarithmic',
            position: 'right',
          },
        },
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Chart.js Doughnut Chart',
          },
        },
      },
    },
  });

  const canvas = vm.$el.getElementsByTagName('canvas');

  it('should have canvas registered', () => {
    expect(canvas).toBeDefined();
  });
  it('should have chartInstance variable instance of Chart.js', () => {
    expect(vm).toBeDefined();
    expect(vm.$data.chartInstance).toBeInstanceOf(Chart);
  });
  it('should not have any console errors', () => {
    expect(console.error).not.toHaveBeenCalled();
  });
});

const TestHooksComponent = defineComponent({
  name: 'TestHooks',
  components: {
    BarChart,
  },
  template: `
  <div id="app" style="width: 400px">
    <BarChart v-bind="barChartProps" />
  </div>
  `,
  setup() {
    const data = ref([30, 40, 60, 70, 5]);
    const legendTop = ref(true);

    const options = computed(() => ({
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    }));

    const testData = computed(() => ({
      labels: ['Paris', 'Nîmes', 'Toulon', 'Perpignan', 'Autre'],
      datasets: [
        {
          data: data.value,
          backgroundColor: ['#77CEFF', '#0079AF', '#123E6B', '#97B0C4', '#A5C8ED'],
        },
      ],
    }));

    const { barChartProps, chartInstance } = useBarChart({
      chartData: testData,
      options: options,
    });

    return { data, barChartProps, chartInstance };
  },
});

describe('Vue 2 - with hooks', () => {
  beforeEach(() => {
    spyOn(console, 'error');
  });

  const { vm } = mount(TestHooksComponent);

  const canvas = vm.$el.getElementsByTagName('canvas');

  it('should have canvas registered', () => {
    expect(canvas).toBeDefined();
  });
  it('should have chartInstance variable instance of Chart.js', () => {
    expect(vm).toBeDefined();
    expect(vm.$data.chartInstance).toBeInstanceOf(Chart);
  });
  it('should not have any console errors', () => {
    expect(console.error).not.toHaveBeenCalled();
  });
});
