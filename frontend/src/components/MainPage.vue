<template>
    <div class="main-page">
        <Header />
        <Home @search-graph="searchGraph" />
        <BrainSurface @search-graph="searchGraph" />
        <KnowledgeGraph ref="knowledgeGraph" />
        <IndicatorTable />
    </div>
</template>

<script>
import Header from './Header.vue';
import Home from './Home.vue';
import BrainSurface from './BrainSurface.vue';
import KnowledgeGraph from './KnowledgeGraph.vue';
import IndicatorTable from './IndicatorTable.vue';

export default {
    name: 'MainPage',
    components: {
        Header,
        Home,
        BrainSurface,
        KnowledgeGraph,
        IndicatorTable,
    },

    data() {
        return {

        };
    },

    methods: {
        searchGraph(name) {
            console.log(name);
            this.$refs.knowledgeGraph.search(name);
            document.getElementById('id-knowledge-graph').scrollIntoView();
        },
    },
};
</script>

<style scoped>
.main-page {
    width: 100%;
    height: 100%;
}
</style>