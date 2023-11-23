<template>
    <el-table 
      :data="todosRecord" 
      stripe 
      style="width: 100%"
      @sort-change="pageSort"
      >
      <el-table-column label="" width="40">
          <template #default="scope">
            <el-checkbox v-model="todosRecord[scope.$index].done" @click.prevent="clickToToggleDone( todosRecord[scope.$index].id )" ></el-checkbox>
          </template>
      </el-table-column>

      <el-table-column prop="content" label="Item name" >
        <template #default="scope" >
          <span :class="todosRecord[scope.$index].done ? 'line-throught' : ''">{{ todosRecord[scope.$index].content }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="createDate" label="Due date" sortable />
      <el-table-column label="" width="40">
        <template #default="scope">
            <el-icon style="vertical-align: middle" color="#E50012" @click.prevent="clickToDel( todosRecord[scope.$index].id )"><Delete  /></el-icon>
        </template>
      </el-table-column>
    </el-table>
</template>

<script setup>
  const props = defineProps(['todosRecord'])
  const emit = defineEmits(['clickToDel','clickToToggleDone','pageSort'])

  const clickToDel = (id) => {
    emit('clickToDel', id)
  }
  const clickToToggleDone = (id) => {
    emit('clickToToggleDone', id)
  }
  const pageSort = (val) => {
    emit('pageSort', val)
  }
</script>