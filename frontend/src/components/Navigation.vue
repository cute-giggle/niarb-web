<template>
    <a-menu v-model:selectedKeys="current" mode="horizontal" theme="dark">

        <a-menu-item key="home">
            <template #icon>
                <home-outlined />
            </template>
            Home
        </a-menu-item>

        <a-sub-menu key="image">
            <template #icon>
                <file-image-outlined />
            </template>
            <template #title>
                Image
            </template>
            <a-menu-item key="structural">
                <template #icon>
                    <pic-center-outlined />
                </template>
                Structural
            </a-menu-item>
            <a-menu-item key="functional">
                <template #icon>
                    <function-outlined />
                </template>
                Functional
            </a-menu-item>
            <a-menu-item key="diffusion">
                <template #icon>
                    <border-inner-outlined />
                </template>
                Diffusion
            </a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="viewer">
            <template #icon>
                <eye-outlined />
            </template>
            <template #title>
                Viewer
            </template>
            <a-menu-item key="surface">
                <template #icon>
                    <cloud-outlined />
                </template>
                Brain surface
            </a-menu-item>
            <a-menu-item key="network">
                <template #icon>
                    <branches-outlined />
                </template>
                Brain network
            </a-menu-item>
            <a-menu-item key="graph">
                <template #icon>
                    <bulb-outlined />
                </template>
                Knowledge graph
            </a-menu-item>
            <a-menu-item key="table">
                <template #icon>
                    <line-chart-outlined />
                </template>
                Indicator table
            </a-menu-item>
        </a-sub-menu>

        <a-menu-item key="about">
            <template #icon>
                <phone-outlined />
            </template>
            About
        </a-menu-item>

    </a-menu>
</template>

<script lang="ts">

import { defineComponent, ref } from 'vue';
import {
    FileImageOutlined,
    EyeOutlined,
    PhoneOutlined,
    HomeOutlined,
    CloudOutlined,
    BranchesOutlined,
    BulbOutlined,
    LineChartOutlined,
    FunctionOutlined,
    PicCenterOutlined,
    BorderInnerOutlined
} from '@ant-design/icons-vue';

export default defineComponent({

    components: {
        FileImageOutlined,
        EyeOutlined,
        PhoneOutlined,
        HomeOutlined,
        CloudOutlined,
        BranchesOutlined,
        BulbOutlined,
        LineChartOutlined,
        FunctionOutlined,
        PicCenterOutlined,
        BorderInnerOutlined
    },

    setup() {
        const current = ref<string[]>(['mail']);
        return {
            current,
        };
    },

});

</script>
