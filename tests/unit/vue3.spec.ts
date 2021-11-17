import { mount } from '@vue/test-utils';
import {
  DoughnutChart,
  BarChart,
  useBarChart,
  ExtractComponentData,
  ExtractComponentProps,
} from '../../src';
import {
  Chart,
  DoughnutController,
  ArcElement,
  Legend,
  Title,
  Tooltip,
  ChartType,
  ChartData,
} from 'chart.js';
import Vue, { defineComponent, ref, computed } from 'vue';

type TestExtractData = ExtractComponentData<typeof DoughnutChart>;
let testAssignData: TestExtractData = {} as TestExtractData;
const canvas: Chart<'doughnut'> | null = testAssignData?.chartInstance;
// Expect no type error

type TestExtractProps = ExtractComponentProps<typeof DoughnutChart>;
let testAssignProps: TestExtractProps = {} as TestExtractProps;
const chartData: ChartData<'doughnut'> = testAssignProps?.chartData;
// Expect no type error

Chart.register(DoughnutController, ArcElement, Legend, Title, Tooltip);

describe('Vue 3 - Doughtnut chart', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error');
  });

  const { vm } = mount(DoughnutChart, {
    props: {
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
    expect(vm.chartInstance).toBeInstanceOf(Chart);
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

    const { barChartProps, barChartRef } = useBarChart({
      chartData: testData,
      options: options,
    });

    return { data, barChartProps, barChartRef };
  },
});

describe('Vue 3 - with hooks', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error');
  });

  const { vm } = mount(TestHooksComponent);

  const canvas = vm.$el.getElementsByTagName('canvas');

  it('should have canvas registered', () => {
    expect(canvas).toBeDefined();
  });
  it('should have barChartRef variable instance of Vue', () => {
    expect(vm).toBeDefined();
    expect(vm.barChartRef).toBeDefined();
  });
  it('should not have any console errors', () => {
    expect(console.error).not.toHaveBeenCalled();
  });
});
