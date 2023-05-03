<script>

import BrainSurface from "../assets/BrainSurface.js";

export default {
    name: "BrainSurface",
    data() {
        return {
            brainSurface: null,
        };
    },
    mounted() {
        this.brainSurface = new BrainSurface(
            "id-brain-surface-view"
        );
    },
};

</script>

<template>
    <div class="brain-surface" id="id-brain-surface">
        <div class="brain-surface-view" id="id-brain-surface-view"></div>
        <div class="brain-surface-info" id="id-brain-surface-info"></div>
    </div>
</template>
  
<style scoped>
.brain-surface {
    display: flex;
    flex-direction: row;
    height: 100%;
    min-width: 100px;
    min-height: 100px;
}

.brain-surface-view {
    flex: 3;
}

.brain-surface-info {
    flex: 1;
}
</style>
