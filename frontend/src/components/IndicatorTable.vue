<template>
    <div class="container">
        <a-row type="flex">
            <div class="description-viewer">
                <div class="description-item">
                    <span style="font-weight: bold;">Description:</span>
                    This part is the statistics and brief display of the relevant global indicators of structural and
                    functional images.
                    More statistics of local indicators can be found in other modules.
                </div>
                <div class="description-item">
                    <span style="font-weight: bold;">For functional images:</span>
                    Using the brain partition template of Shaefer2018 400regions 7networks,
                    the correlation network between regions is constructed by using dsi studio tool and HCP1200 data set,
                    and the topological properties of the correlation network are calculated after binarization.
                    There are many binarization methods. Here, the method of retaining a fixed proportion of edges is used.
                </div>
                <div class="description-item">
                    <span style="font-weight: bold;">For structural images:</span>
                    Using FreeSurfer tool and HCP1200 data set,
                    the chart is obtained by statistical collation of the results of automatic segmentation.
                </div>
            </div>
        </a-row>
        <a-row type="flex">
            <a-col :span="6">
                <a-layout-header class="functional-list-header">
                    Functional global indicators
                </a-layout-header>
                <div class="functional-list">
                    <a-list bordered :dataSource="functionalIndicators">
                        <a-list-item v-for="item in functionalIndicators" :key="item">
                            <span class="list-item" @click="getData('functional', item)">{{ item }}</span>
                        </a-list-item>
                    </a-list>
                </div>
                <a-layout-header class="structural-list-header">
                    Structural global indicators
                </a-layout-header>
                <div class="structural-list">
                    <a-list bordered :dataSource="structuralIndicators">
                        <a-list-item v-for="item in structuralIndicators" :key="item">
                            <span class="list-item" @click="getData('structural', item)">{{ item }}</span>
                        </a-list-item>
                    </a-list>
                </div>
            </a-col>
            <a-col :span="18">
                <div class="chart-viewer">
                    <canvas id="id-chart"></canvas>
                </div>
            </a-col>
        </a-row>
    </div>
</template>

<script>
import axios from 'axios';
import { defineComponent, ref } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default defineComponent({

    components: {
    },

    setup() {

        const functionalIndicators = ref([]);
        const structuralIndicators = ref([]);

        const currentData = ref({});

        const getFunctionalIndicators = async () => {
            const response = await axios.get('http://localhost:8000/api/global-indicator-name/', { params: { type: 'functional' } });
            functionalIndicators.value = response.data;
        };

        const getStructuralIndicators = async () => {
            const response = await axios.get('http://localhost:8000/api/global-indicator-name/', { params: { type: 'structural' } });
            structuralIndicators.value = response.data;
        };

        const drawChart = () => {
            const ctx = document.getElementById('id-chart').getContext('2d');

            if (window.chart) {
                window.chart.destroy();
            }

            window.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: currentData.value.data.bins,
                    datasets: [{
                        label: currentData.value.name,
                        data: currentData.value.data.hist,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        };

        const getData = async (type, name) => {
            const response = await axios.get('http://localhost:8000/api/global-benchmark/', { params: { type: type, name: name } });
            currentData.value = {
                type: type,
                name: name,
                data: response.data,
            };
            console.log(currentData.value);
            drawChart();
        };

        getFunctionalIndicators();
        getStructuralIndicators();
        getData('functional', 'global efficiency');

        return {
            functionalIndicators,
            structuralIndicators,
            getFunctionalIndicators,
            getStructuralIndicators,
            getData,
            currentData,
        };
    },
});
</script>

<style scoped>
.container {
    padding: 10px;
    border: 2px solid white;
    border-radius: 10px;
    background-color: black;
}

.functional-list-header {
    text-align: center;
    background-color: rgb(210, 235, 230);
    border-radius: 10px 10px 0px 0px;
    padding: 0px 10px;
    font-size: 20px;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.structural-list-header {
    text-align: center;
    background-color: rgb(210, 235, 230);
    border-radius: 10px 10px 0px 0px;
    padding: 0px 10px;
    font-size: 20px;
    font-weight: bold;
    margin-top: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.functional-list {
    max-height: 260px;
    overflow-y: auto;
    background-color: rgb(240, 240, 250);
}

.structural-list {
    max-height: 260px;
    overflow-y: auto;
    background-color: rgb(240, 240, 250);
}

.list-item {
    width: 100%;
    font-size: 16px;
    font-weight: 400;
    cursor: pointer;
    text-align: center;
}

.list-item:hover {
    background-color: #b7d0f1;
}

.chart-viewer {
    border: 2px solid white;
    border-radius: 10px;
    background-color: rgb(230, 235, 235);
    height: 100%;
    margin-left: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.description-viewer {
    border: 2px solid white;
    border-radius: 10px;
    background-color: rgb(240, 245, 220);
    max-height: 250px;
    overflow-y: auto;
    width: 100%;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 5px;
}

.description-item {
    border: 1px solid white;
    background-color: rgb(215, 235, 235);
    border-radius: 5px;
    width: 100%;
    font-size: 18px;
    margin-top: 5px;
    padding: 5px;
    font-style: oblique;
}
</style>