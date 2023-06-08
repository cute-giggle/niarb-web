<template>
    <!-- 固定顶部 -->
    <a-layout-header style="position: fixed; z-index: 1; width: 100%;">
        <a-row type="flex" justify="space-between">

            <a-col :span="2">
                <img src="../assets/img/logo.jpg" style="height: 64px; padding: 16px;" />
            </a-col>

            <a-col :span="3"></a-col>

            <a-col :span="10">
                <Navigation />
            </a-col>

            <a-col :span="6">
                <Search />
            </a-col>

            <a-col :span="2"></a-col>

            <a-col :span="1">
                <LoginPage />
            </a-col>

        </a-row>
    </a-layout-header>
</template>

<script lang="ts">

import { defineComponent } from 'vue';
import Navigation from './Navigation.vue';
import Search from './Search.vue';
import LoginPage from './LoginPage.vue';

export default defineComponent({

    components: {
        Navigation,
        Search,
        LoginPage,
    },

    setup() {
        return {

        };
    },

});

</script>