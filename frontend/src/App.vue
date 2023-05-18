<script>
import BrainSurface from "./components/BrainSurface.vue";
// import BrainNetwork from "./components/BrainNetwork.vue";
import KnowledgeGraph from "./components/KnowledgeGraph.vue";

export default {
    name: "App",
    components: {
        BrainSurface,
        // BrainNetwork,
        KnowledgeGraph,
    },
};
</script>

<template>
    <div style="width: 100%; height: 100%;">
        <BrainSurface />
    </div>
</template>

<style scoped></style>
