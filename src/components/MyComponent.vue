<template>
    <div>
        My template is loaded: {{ message }}
    </div>
</template>

<script>
    export default {
        props: {
            message: {
                type: String,
                default: 'Hello World!'
            },
        },
    }
</script>

<style scoped>
    div {
        border: 1px solid black;
    }
</style>