<template>
    <el-button 
        @click="getTodoList(todosCollectionQuery, 'all')" 
        :class="queryType === 'all' ? 'el-button--primary' : 'is-text'" 
        type="primary"
        >All</el-button>
    <el-button 
        @click="getTodoList(todosCollectionDoneQuery, 'done')" 
        :class="queryType === 'done' ? 'el-button--primary' : 'is-text'" 
    >Done</el-button>
    <el-button 
        @click="getTodoList(todosCollectionUndoneQuery, 'undone')" 
        :class="queryType === 'undone' ? 'el-button--primary' : 'is-text'" 
    >Undone</el-button>  
</template>

<script setup>
    const props = defineProps(['queryType', 'todosCollectionQuery', 'todosCollectionDoneQuery', 'todosCollectionUndoneQuery'])
    const emit = defineEmits(['getTodoList'])

    const getTodoList = (q, type) => {
        emit('getTodoList', q, type)
    }
</script>