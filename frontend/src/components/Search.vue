<template>
    <div style="height: 64px; align-items: center; display: flex;">
        <a-input-search v-model:value="value" placeholder="Search" @search="onSearch" size="large" />
    </div>
</template>

<script lang="ts">

import { defineComponent, ref } from 'vue';
import { SearchOutlined } from '@ant-design/icons-vue';

export default defineComponent({

    components: {
        SearchOutlined,
    },

    setup() {
        const value = ref<string>('');
        const onSearch = (value: string) => {
            console.log(value);
        };
        return {
            value,
            onSearch,
        };
    },

});

</script>  