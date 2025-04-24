<template>
  <div class="container">
    <el-affix :offset-top="100" class="filter-affix">
      <div class="filter-affix">
        <div class="filter-bar">
          <div class="type-toggle">
            <!--     筛选类型按钮       -->
            <el-button
                type="text"
                @click.stop="toggleTypeMenu"
                class="type-btn"
                :class="{ 'active-btn': isActive }"
            >
              全部类型
            </el-button>
          </div>
          <!--    筛选栏右侧      -->
          <div class="filter-right">
            <el-button type="primary">热度最高</el-button>
            <el-button>新上架</el-button>
            <el-button>豆瓣高分</el-button>
          </div>
        </div>
        <!--    一级菜单    -->
        <div v-if="isTypeMenuVisible" class="menu-bar">
          <div
              v-for="item in firstLevelOptions"
              :key="item.value"
              :class="['menu-item', { active: selectedFirst === item.value }]"
              @click="handleFirstLevelClick(item.value)"
          >
            {{ item.label }}
          </div>
        </div>
        <!--   二级菜单     -->
        <transition name="fade">
          <div
              v-if="showSecondMenu && currentSecondLevelOptions.length"
              class="second-menu-bar"
          >
            <div
                v-for="item in currentSecondLevelOptions"
                :key="item.value"
                :class="['second-menu-item', { active: selectedSecond === item.value }]"
                @click="handleSecondLevelClick(item.value)"
            >
              {{ item.label }}
            </div>
          </div>
        </transition>
      </div>
    </el-affix>

    <!--  当前分类提示  -->
    <div class="selected-box">
      当前筛选：<span>{{ getSelectedText }}</span>
    </div>

    <!--  图书列表  -->
    <div class="book-list">
      <el-row :gutter="[16, 16]">
        <el-col
            v-for="(book, index) in books.record"
            :key="index"
            :xs="24"
            :sm="12"
            :md="12"
            :lg="12"
        >
          <el-card class="book-card">
            <div class="book-content">
              <!--  封面   -->
              <div class="book-cover">
                <img :src="book.cover" alt="书籍封面" />
              </div>
              <!--  图书信息   -->
              <div class="book-info">
                <h1 class="book-title">{{ book.title }}</h1>
                <p class="book-author">作者：{{ book.author }}</p>
                <!--                <el-tooltip-->
                <!--                    :content="book.description"-->
                <!--                    raw-content-->
                <!--                    class="custom-tooltip"-->
                <!--                >-->
                <p class="book-desc" >{{ book.description }}</p>
                <!--                </el-tooltip>-->
                <div class="book-meta">
                  <el-tag type="primary" size="small">热度：{{ book.downloadCount }}</el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
          v-model:current-page="bookPageQueryDTO.pageNum"
          v-model:page-size="bookPageQueryDTO.pageSize"
          :page-sizes="[6, 10, 20]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="books.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"/>
    </div>

  </div>
</template>

<script setup>
import {reactive, ref, computed } from 'vue'
import request from '@/utils/request'

// 全部类型按钮是否激活
const isActive = ref(false);
// 全部类型是否展开
const isTypeMenuVisible = ref(false)
// 默认一级菜单选中全部
const selectedFirst = ref('all')
// 二级菜单初始值
const selectedSecond = ref('')
// 得到目前选中一级菜单下的二级菜单的值
const currentSecondLevelOptions = computed(() => secondLevelMap[selectedFirst.value] || [])
// 展开一级菜单下的二级菜单
const showSecondMenu = computed(() => selectedFirst.value !== 'all')
// 图书的总记录数与数据
const books = reactive({
  total: 0,
  record: [],
})
// 点击全部类型筛选后触发
function toggleTypeMenu() {
  isTypeMenuVisible.value = !isTypeMenuVisible.value
  if (!isTypeMenuVisible.value) selectedFirst.value = 'all'
}
// 一级菜单中的选项
const firstLevelOptions = ref([{ value: 'all', label: '全部' }])
// 二级菜单中的选项
const secondLevelMap = reactive({})
// 获取所有类型
function getAllCategory() {
  request.get('/user/bookCategory/all')
      .then(res => {
        const data = res.data

        firstLevelOptions.value = [{ value: 'all', label: '全部' }]
        Object.keys(secondLevelMap).forEach(key => delete secondLevelMap[key])

        data.forEach(category => {
          firstLevelOptions.value.push({
            value: String(category.id),
            label: category.name
          })

          if (Array.isArray(category.children) && category.children.length > 0) {
            // 添加"全部"选项到子分类前面
            const childrenWithAll = [
              {
                value: 'all',
                label: '全部',
                // 保持与后端接口一致的字段名
                id: 'all',
                name: '全部'
              },
              ...category.children
            ].map(child => ({
              value: child.id === 'all' ? 'all' : String(child.id),
              label: child.name
            }))

            secondLevelMap[String(category.id)] = childrenWithAll
          } else {
            secondLevelMap[String(category.id)] = [{ value: 'all', label: '全部' }]
          }
        })
      })
      .catch(err => {
        console.log(err)
      })
}
// 页面启动时查询所有类型
getAllCategory()
// 查询选中类型的图书
function getSelectedCategoryBooks(firstId, secondId) {
  request.get('/user/book/selectedCategoryBooks',{
    params: {
      pageNum: bookPageQueryDTO.pageNum,
      pageSize: bookPageQueryDTO.pageSize,
      firstId: firstId,
      secondId: secondId,
    }
  }).then((res) => {
    console.log(res)
    books.total = res.data.total
    books.record = res.data.records
  }).catch((err) => {
    console.log(err)
  })
}
// 点击一级菜单选项后触发
function handleFirstLevelClick(value) {
  if (selectedFirst.value !== value) {
    selectedFirst.value = value
    selectedSecond.value = value === 'all' ? '' : 'all'
  }
  if (value === 'all') selectedSecond.value = ''

  // value值是categoryId
  getSelectedCategoryBooks(value,0)
}
// 点击二级菜单选项后触发
function handleSecondLevelClick(value) {
  selectedSecond.value = value
  if(value === 'all')
    getSelectedCategoryBooks(selectedFirst.value,0)
  else
    getSelectedCategoryBooks(selectedFirst.value,value)
}
// 获取当前选中的类型
const getSelectedText = computed(() => {
  const first = firstLevelOptions.value.find(item => item.value === selectedFirst.value)

  if (selectedFirst.value === 'all') return first?.label || ''
  if (selectedSecond.value === 'all') return `${first?.label || ''} > 全部`
  if (!selectedSecond.value) return first?.label || ''

  const second = (secondLevelMap[selectedFirst.value] || []).find(
      item => item.value === selectedSecond.value
  )

  return second ? `${first?.label || ''} > ${second.label}` : first?.label || ''
})
// 分页查询实体
const bookPageQueryDTO = reactive({
  pageNum: 1,
  pageSize: 10,
  keyWord: '',
})
// 分页查询
const load = () =>{
  request.get('/user/book/page',{
    params: {
      pageNum: bookPageQueryDTO.pageNum,
      pageSize: bookPageQueryDTO.pageSize,
      keyWord: bookPageQueryDTO.keyWord,
    }
  }).then((res) => {
    books.total = res.data.total
    books.record = res.data.records
  }).catch((err) => {
    console.log(err)
  })
}
// 加载页面时调用分页查询
load()
// 选择每页显示多少条记录时，触发分页查询
const handleSizeChange = () =>{
  load()
}
// 跳转其他页面的时候触发分页查询
const handleCurrentChange = () =>{
  load()
}

</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.filter-affix {
  background-color: #f5f7fa;
  border-radius: 8px;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.type-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}
.type-btn {
  padding: 10px 24px;
  border-radius: 4px 4px 0 0;
  background: #fff;
  color: #333;
  font-size: 16px;
  transition: all 0.3s;
  border-bottom: 1px solid #eee;
}

.active-btn {
  background: #409eff !important;
  color: #fff !important;
  border-bottom: none !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.type-btn:active {
  transform: scale(0.98);
}

.type-btn:hover {
  background: #f5f7fa;
}

.menu-bar {
  display: flex;
  gap: 18px;
  margin-top: 8px;
  background: #f7f8fa;
  padding: 10px 0;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.03);
}

.menu-item {
  cursor: pointer;
  padding: 8px 20px;
  border-radius: 3px;
  background: #f7f8fa;
  color: #333;
  font-size:12px;
  transition: all 0.2s;
  position: relative;
  margin-bottom: 4px;
}

.menu-item:hover {
  background: #eef2fb;
}

.menu-item.active {
  background: #409eff;
  color: #fff;
  font-weight: bold;
  margin-bottom: 0;
  box-shadow: 0 -2px 4px 0 rgba(64,158,255,0.2);
}

.second-menu-bar {
  flex-wrap: nowrap;
  overflow-x: auto;
  display: flex;
  gap: 8px;
  background: #f7f8fa;
  padding: 10px 0 10px 10px;
  border-radius: 0 0 6px 6px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.03);
}

.second-menu-item {
  flex-wrap: nowrap;
  overflow-x: auto;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 3px;
  background: #fff;
  color: #333;
  font-size: 12px;
  transition: background 0.2s;
}

.second-menu-item:hover {
  background: #f7f8fa;
}

.second-menu-item.active {
  background: #409eff;
  color: #fff;
  font-weight: bold;
}

.selected-box {
  margin: 10px 0;
  color: #666;
  font-size: 15px;
}

.el-col {
  padding: 8px !important;
}

.book-list {
  padding: 10px;
  gap: 16px;
}

.book-card {
  min-height: 100%;
  display: flex;
  flex-direction: row;
  margin: 10px !important;
  transition: all 0.3s;

}

.book-content {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.book-cover {
  flex: 0 0 100px;
  padding: 5px;
}

.book-cover img {
  width: 100%;
  height: auto;
  max-height: 150px;
  object-fit: cover;
  border-radius: 2px;
}

.book-info {
  flex: 1;
  padding: 0 7px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.book-title {
  margin: 0 0 8px;
  font-size: 18px;
  color: #333;
}

.book-author {
  color: #666;
  margin: 3px 0;
  font-size: 12px;
}

.book-desc {
  flex: 1;
  color: #444;
  margin: 8px 0;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  cursor: pointer;
}

.book-meta {
  margin-top: 10px;
}


@media (max-width: 768px) {
  .el-col {
    padding: 4px !important;
  }
  .book-card {
    margin: 4px !important;
  }
}

.book-card:hover {
  transform: translateY(-5px);
}

.custom-tooltip{
  width: auto !important;
  max-width: 100px;
}

.pagination-wrapper {
  margin: 20px 0;
  display: flex;
  justify-content: center;
  padding: 0 20px;
}

</style>