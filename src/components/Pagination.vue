<template>
      <el-row class="table-footer">
      <el-col :sm="8" :xs="24" class="summary">
            <el-text size="small" class="show-range">Showing {{(paginationObj.start + 1)}} - <span><span v-if="paginationObj.total > end">{{(paginationObj.end)}}</span> <span v-else>{{(paginationObj.total)}}</span> item<span v-if="paginationObj.total > 1">s</span></span></el-text>
            <el-text size="small" class="show-total">Total {{paginationObj.total}} items</el-text>
      </el-col>
      <el-col :sm="16" :xs="24" class="pagination">
             <el-pagination
              v-model:current-page="paginationObj.currentPage" 
              background small
              v-if="todosRecord.length"
              layout="total, prev, pager, next" 
              :total="paginationObj.total"
              :default-page-size="paginationObj.pageSize"
              @current-change="pageChange"
            />
      </el-col>
    </el-row>
</template>

<script setup>
    const props = defineProps(['paginationObj', 'todosRecord'])
    const {start, end, total} = props.paginationObj

    const emit = defineEmits('pageChange')

    const pageChange = (val) => {
        emit('pageChange', val)
    }
</script>
