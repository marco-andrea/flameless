<template>
</template>

<script>
export default {
    middleware: [
        ({ redirect }) => {
            redirect('/sites');
        },
    ],
}
</script>
