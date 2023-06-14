<template>
    <div class="home" id="id-home">
        <a-row type="flex" justify="space-around" style="height: 100%; width: 100%;">
            <a-col :span="12"></a-col>
            <a-col :span="12">
                <div class="home-content">
                    <img src="../assets/img/logo-text.png" style="width: 100px; height: 50px;" />
                    <div class="home-tittle">
                        <div style="font-size: 26px; color: white; font-weight: bold;">
                            Niarb Knowledge Graph Dev-0.0.1
                        </div>
                    </div>
                    <div class="home-search">
                        <a-input placeholder="Search for brain-related concepts" v-model:value="searchText"
                            style="width: 600px; height: 50px; border-radius: 10px;" @keyup.enter.native="searchGraph" />
                    </div>
                    <div class="home-demo">
                        <span></span>
                        <a @click="() => {this.searchText = 'Brodmann.1'; this.searchGraph(); }">Brodmann.1</a>
                        <a @click="() => {this.searchText = 'Paracentral'; this.searchGraph(); }">Paracentral</a>
                        <a @click="() => {this.searchText = 'Supramarginal'; this.searchGraph(); }">Supramarginal</a>
                        <span></span>
                    </div>
                </div>
            </a-col>
        </a-row>
    </div>
</template>

<script>

export default {
    name: "Home",
    methods: {
        searchGraph() {
            console.log(this.searchText);
            this.$emit('search-graph', this.searchText);
            this.searchText = '';
        },
    },
    data() {
        return {
            searchText: '',
        };
    },
};
</script>

<style scoped>
.home {
    width: 100%;
    height: 100%;
    background-image: url("../assets/img/bg.jpg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

.home-content {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.home-search {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
}

.home-demo {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    margin-top: 20px;
}
</style>