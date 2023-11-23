<template>
  <div class="common-layout">
    <el-container>
      <el-main>
        <el-row class="header-row">
          <el-col :span="24">
            <input class="h1-input" type="text" v-model="todolistName" />
            <el-button color="#626aef" class="hidden-md-and-up" @click="dialogVisible = true" type="success" :icon="Plus">Add</el-button>
          </el-col>
        </el-row>
        <el-row class="action-bar-row">
          <el-col :span="24" class="action-bar">
            <el-button color="#626aef" class="hidden-sm-and-down" @click="dialogVisible = true" type="success" :icon="Plus">Add</el-button>
              <Filter 
                  :queryType="qType" 
                  @getTodoList="getTodo"
                  :todosCollectionQuery="todosCollectionQuery"
                  :todosCollectionDoneQuery="todosCollectionDoneQuery"
                  :todosCollectionUndoneQuery="todosCollectionUndoneQuery"
              />
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <TodoList 
              :todosRecord="todos" 
              @clickToDel="deleteTodo" 
              @clickToToggleDone="toggleDone" 
              @pageSort="handlePageSort"
            />
            </el-col>
        </el-row>
        <Pagination :paginationObj="paginationObj" :todosRecord="todos" @pageChange="handlePageChange" />
      </el-main>
    </el-container>
  </div>
  <el-dialog
    v-model="dialogVisible"
    title="New to do item"
    class="dialog-add"
  >
    <el-form class="form-add" @submit.prevent="addTodo" label-position="top">
        <el-form-item label="Item name">
          <el-input 
            ref="btnNewTodoContent"
            id="newTodoContent"
            type="text"
            class="input"
            placeholder="Item name" 
            @blur="validateName"
            v-model="newTodoContent"
            :class="nameError ? 'error-input' : ''"
          />
          <div v-if="nameError" class="error-message">{{ nameError }}</div>
        </el-form-item>
        <el-form-item label="Due date">
          <el-date-picker
          ref="btnNewTodoCreatedate"
            id="newTodoCreatedate"
            v-model="newTodoCreatedate"
            type="date"
            class="input"
            format="YYYY-MM-DD"
            :picker-options="datepickerOpt"
            placeholder="Select date"           
            @change="validateDate"
            @blur="validateDate"
            :class="dateError ? 'error-input' : ''"
          />
          <div v-if="dateError" class="error-message">{{ dateError }}</div>
        </el-form-item>
        <div class="dialog-footer">
          <button 
            :disabled="(!newTodoContent &&  !newTodoCreatedate)" 
            :class="(!newTodoContent || !newTodoCreatedate) ? 'disabled' : ''" 
            class="btn-save el-button el-button--primary"
          >Save</button>
        </div>
    </el-form>
  </el-dialog>
</template>

<script setup>
import TodoList from '../components/TodoList.vue'
import Pagination from '../components/Pagination.vue'
import Filter from '../components/Filter.vue'
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import 'element-plus/theme-chalk/display.css'
import { 
  collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc,
  query, where, orderBy, limit, startAt, startAfter, getCountFromServer
} from 'firebase/firestore'
import { db } from '@/firebase'

const todolistName = ref(localStorage.getItem('todolistNameLocal') || 'To do list');
watch(todolistName, (newValue) => {
  localStorage.setItem('todolistNameLocal', newValue);
});
const dialogVisible = ref(false)
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1);
const start = ref((currentPage.value -1) * pageSize.value)
const end = ref(start.value + pageSize.value)
const todayYMD = ref(new Date().toJSON().slice(0,10))
const newTodoContent = ref('')
const newTodoCreatedate = ref('')
const nameError = ref('')
const dateError = ref('')

//Firebase
const todosCollectionsRef = collection(db, 'todos')
const todosCollectionQuery = query(todosCollectionsRef, orderBy('createDate', 'desc'))
const todosCollectionQueryAsc = query(todosCollectionsRef, orderBy('createDate', 'asc'))
const todosCollectionDoneQuery = query(todosCollectionsRef, where('done', '==', true), orderBy('createDate', 'desc'))
const todosCollectionDoneQueryAsc = query(todosCollectionsRef, where('done', '==', true), orderBy('createDate', 'asc'))
const todosCollectionUndoneQuery = query(todosCollectionsRef, where('done', '==', false), orderBy('createDate', 'desc'))
const todosCollectionUndoneQueryAsc = query(todosCollectionsRef, where('done', '==', false), orderBy('createDate', 'asc'))
const todos = ref([])
const fbTodos = ref([])

const paginationObj = reactive({
  start: 0,
  end: 10,
  total: 0,
  currentPage: 1,
  pageSize: 10
})

const getPageObj = computed(()=> {
  return paginationObj
})

const qType = ref('all')

const getTodo = (q, type) => {

  qType.value = type ? type : 'all';

        onSnapshot(q, (querySnapshot) => {
              fbTodos.value = [];

          querySnapshot.forEach((doc) => {
              const todo = {
                id: doc.id,
                content: doc.data().content,
                done: doc.data().done,
                createDate: ((doc.data().createDate.seconds) + (3600 * 8)) * 1000
              }
              const tmpCreateDate = new Date(todo.createDate)

              todo.createDate = tmpCreateDate.toISOString().split('T')[0]

              fbTodos.value.push(todo)
          });
          
          paginationObj.start = 0
          paginationObj.end = pageSize.value
          paginationObj.currentPage = 1

          console.log('fbTodos.value: ', fbTodos.value)
          todos.value = fbTodos.value.slice(start.value, end.value)
          total.value = fbTodos.value.length

          paginationObj.total = fbTodos.value.length

        })
  }


onMounted(() => {
  getTodo(todosCollectionQuery, 'all')
})



const handlePageChange = (newPage) => {   
    paginationObj.start = (newPage -1) * paginationObj.pageSize
    paginationObj.end = paginationObj.start + paginationObj.pageSize
    todos.value = fbTodos.value.slice(paginationObj.start, paginationObj.end)
}

const handlePageSort = ({ column, prop, order }) => {
  order === 'ascending' ? getTodo(todosCollectionQueryAsc) : getTodo(todosCollectionQuery)
}

//validation
const validateName = () => {
  nameError.value = '';
  if (newTodoContent.value === '') {
        nameError.value = 'This is a required field';
  }
} 

const validateDate = () => {
  dateError.value = '';
  if (newTodoCreatedate.value === '') {
      dateError.value = 'This is a required field';
  }
  if (newTodoCreatedate.value && new Date(newTodoCreatedate.value) < new Date(todayYMD.value) ) {
      dateError.value = 'Due data must not be earlier than today'
  }
} 

const datepickerOpt = computed(() => {
  const today = new Date();
      return {
        disabledDate: (date) => {
          return date && date < today;
        }
      }
})

const addTodo = () => {
  //submit firebase
  addDoc(todosCollectionsRef, {
    content: newTodoContent.value,
    done: false,
    createDate: newTodoCreatedate.value
  })

  newTodoContent.value = ''
  newTodoCreatedate.value = ''
  dialogVisible.value = false
}

const deleteTodo = (id) => {
  deleteDoc(doc(todosCollectionsRef, id))
}

const toggleDone = (id) => {
  const index = todos.value.findIndex(todo => todo.id === id)
  updateDoc(doc(todosCollectionsRef, id), {
    done: !todos.value[index].done
  });
}
</script>

<style>
.common-layout {
  margin: 20px auto 0;
  max-width: 48rem;
  background: #ffffff;
  border-radius: 6px;
  padding:2rem;
}
.header-row > div{
  display: flex;
  align-items: center;
}
.h1-input{
  width: 90%;
  font-size: 2rem;
  margin: 0 30px 0 0;
  font-weight: 400;
  border: none;
  border-bottom: 1px solid #ffffff;
  height: 40px;
}
.h1-input:hover{
  border-bottom: 1px solid rgb(118, 118, 118);
}
.h1-input:focus{
  outline: none;
}
.action-bar{
  display: flex;
}
.line-throught{
  text-decoration: line-through;
}
.el-button.is-link{
  color: #409eff;
}
.error-input{
  border:1px solid #E50012;
  border-radius: 4px;
}
.error-message{
  color: #E50012;
  font-size: 14px;
  display: block;
  width: 100%;
}
.dialog-add {
  width: max(40vw, 375px)
}
.dialog-add header{
  border-bottom: 1px solid #dcdfe6;
  font-weight: 600;
  padding-right: 55px;
  margin-right: 0;
}
.el-dialog__headerbtn .el-dialog__close{
  font-size: 1.8rem;
}
.dialog-add .el-dialog__body{
  padding: 0;
}
.dialog-add .dialog-footer{
  margin-top: 20px;
  border-top: 1px solid #dcdfe6;
  padding: 1rem 20px;
  text-align: right;
}
.form-add .el-form-item{
  margin: 20px 20px 0;
}
.el-form-item__content{
  flex-direction: row;
}
button.disabled.el-button.el-button--primary{
  color: #ffffff;
  background-color: #a0cfff;
  border-color: #a0cfff;
}
.el-table__header-wrapper{
  border-bottom: 2px solid #606266;
}
.el-table thead{
  color:#606266;
  font-weight: 600;
}
.el-table__body-wrapper .el-scrollbar{
  min-height: 490px;
}
.table-footer .el-col{
  align-content: center;
}
.el-pagination.is-background.el-pagination--small{
  justify-content: end;
}
span.el-pagination__total.is-first:after{
  content: ' items'
}
span.el-text.el-text--small.show-total{
    display: none;
}

@media (min-width: 768px) and (max-width: 1023px) {
  .common-layout {
    margin: 0 auto;
    border-radius: 0;
    padding:0;
  }
  .dialog-add{
    width: 80%;
  }
  span.el-text.el-text--small.show-total{
    display: none;
  }
  .el-date-editor.el-input, .el-input__inner, button.disabled.el-button.el-button--primary{
    height: 44px;
  }
}

@media (max-width: 767px) {
  .common-layout {
    margin: 0 auto;
    border-radius: 0;
    padding:0;
  }
  .action-bar-row{
    margin-left: -20px;
    margin-right: -20px;
  }
  .action-bar{
    overflow-x: scroll;
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .table-footer{
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .table-footer .summary, .table-footer .pagination{
    padding: 0.5rem;
  }
  .table-footer .summary{
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content:space-between;
  }
  .table-footer span.el-pagination__total.is-first {
     display: none;
  }
  .el-pagination.is-background .btn-prev {
    margin-left: 0;
  }
  .table-footer .summary .show-range, .table-footer .summary .show-total {
    flex: 1;
  }
  span.el-text.el-text--small.show-total {
    display: block;
    text-align: right;
  }
  li.is-active.number, li.number{
    width: 44px !important;
    height: 44px !important;
    border-radius: 4px;
  }
  .el-dialog{
    border-radius: 0;
  }
  .dialog-add{
    width: 100%;
    margin: 0; 
    height: 100vh;
  }
  .dialog-add .dialog-footer{
    position: absolute;
    bottom: 0;
    text-align: center;
  }
  .el-date-editor.el-input, 
  .el-input__inner, 
  button.disabled.btn-save, 
  button.btn-save{
    width: 100%;
    height: 44px;
  }
  button.disabled.btn-save,
  button.btn-save{
    width: calc(100vw - 40px);
  }  
}
</style>