<script>
import Header from "./components/Header.vue";
import BrainSurface from "./components/BrainSurface.vue";
import KnowledgeGraph from "./components/KnowledgeGraph.vue";
import IndicatorTable from "./components/IndicatorTable.vue";
import MainPage from "./components/MainPage.vue";

export default {
    name: "App",
    components: {
        Header,
        MainPage,
        BrainSurface,
        KnowledgeGraph,
        IndicatorTable,
    },
};
</script>

<template>
    <div class="main-app">
        <!-- <Header /> -->
        <MainPage />
        <!-- <BrainSurface /> -->
        <!-- <KnowledgeGraph /> -->
        <!-- <IndicatorTable /> -->
    </div>
</template>

<style scoped>
.main-app {
    width: 100%;
    height: 100%;
    padding: auto;
}
</style>
