<script>
import Header from "./components/Header.vue";
import BrainSurface from "./components/BrainSurface.vue";
import KnowledgeGraph from "./components/KnowledgeGraph.vue";
import IndicatorTable from "./components/IndicatorTable.vue";

export default {
    name: "App",
    components: {
        Header,
        BrainSurface,
        KnowledgeGraph,
        IndicatorTable,
    },
};
</script>

<template>
    <div style="width: 100%; height: 100%;">
        <!-- <Header /> -->
        <BrainSurface />
        <KnowledgeGraph />
        <!-- <IndicatorTable /> -->
    </div>
</template>

<style scoped></style>
