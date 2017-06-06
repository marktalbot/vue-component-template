<template>
    <div>
        My template is loaded: {{ isLoaded }}
    </div>
</template>

<script>
    export default {
        props: {
            isLoaded: true
        }
    }
</script>

<style scoped>
    div {
        border: 1px solid black;
    }
</style>