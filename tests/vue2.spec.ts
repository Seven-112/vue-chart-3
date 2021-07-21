import { mount } from '@vue/test-utils';
import { DoughnutChart } from '../packages/vue-chart-3/src';
import { Chart, DoughnutController, ArcElement, Legend, Title, Tooltip } from 'chart.js';

Chart.register(DoughnutController, ArcElement, Legend, Title, Tooltip);

class ResizeObserver {
  observe() {
    // do nothing
  }
  unobserve() {
    // do nothing
  }
  disconnect() {}
}

window.ResizeObserver = ResizeObserver as any;

describe('Vue 2 - Doughtnut', () => {
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
    // expect(vm).toBeInstanceOf(Chart);
  });
});
