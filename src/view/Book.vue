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
                @click="test"
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
      <el-row :gutter="20">
        <el-col :span="6" v-for="(book, index) in 8" :key="index">
          <el-card class="book-card">
            <div class="book-cover"></div>
            <div class="book-info">
              <h3>图书名称 {{ index + 1 }}</h3>
              <p>作者：张三</p>
              <p>评分：⭐⭐⭐⭐⭐</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const isActive = ref(false);
const isTypeMenuVisible = ref(false)
const selectedFirst = ref('all')
const selectedSecond = ref('')

const test = () => {
  isActive.value = !isActive.value;
}

const firstLevelOptions = [
  { value: 'all', label: '全部' },
  { value: 'a', label: '甲' },
  { value: 'b', label: '乙' },
  { value: 'c', label: '丙' },
  { value: 'd', label: '丁' }
]

const secondLevelMap = {
  a: [{ value: 'typeA1', label: '类型A1' }, { value: 'typeA2', label: '类型A2' }],
  b: [{ value: 'typeB1', label: '类型B1' }, { value: 'typeB2', label: '类型B2' }, { value: 'typeB3', label: '类型B3' }],
  c: [{ value: 'typeC1', label: '类型C1' }],
  d: [{ value: 'typeD1', label: '类型D1' }, { value: 'typeD2', label: '类型D2' }]
}

const currentSecondLevelOptions = computed(() => secondLevelMap[selectedFirst.value] || [])
const showSecondMenu = computed(() => selectedFirst.value !== 'all')

function toggleTypeMenu() {
  isTypeMenuVisible.value = !isTypeMenuVisible.value
  if (!isTypeMenuVisible.value) selectedFirst.value = 'all'
}

function handleFirstLevelClick(value) {
  if (selectedFirst.value !== value) {
    selectedFirst.value = value
    selectedSecond.value = ''
  }
  if (value === 'all') selectedSecond.value = ''
}

function handleSecondLevelClick(value) {
  selectedSecond.value = value
}

const getSelectedText = computed(() => {
  const first = firstLevelOptions.find(item => item.value === selectedFirst.value)
  if (selectedFirst.value === 'all') return first.label
  if (!selectedSecond.value) return first.label
  const second = (secondLevelMap[selectedFirst.value] || []).find(item => item.value === selectedSecond.value)
  return second ? `${first.label} > ${second.label}` : first.label
})
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
  transition: all 0.3s; /* 增加过渡效果 */
  border-bottom: 1px solid #eee;
}

/* 高亮状态 */
.active-btn {
  background: #409eff !important;
  color: #fff !important;
  border-bottom: none !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 点击瞬时反馈 */
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
  font-size: 15px;
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
  display: flex;
  gap: 18px;
  background: #f7f8fa;
  padding: 10px 0 10px 10px;
  border-radius: 0 0 6px 6px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.03);
}

.second-menu-item {
  cursor: pointer;
  padding: 8px 20px;
  border-radius: 3px;
  background: #fff;
  color: #333;
  font-size: 15px;
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

.book-list {
  margin-top: 20px;
}

.book-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.book-card:hover {
  transform: translateY(-5px);
}

.book-cover {
  width: 100%;
  height: 200px;
  background-color: #eee;
  border-radius: 4px;
}

.book-info {
  padding: 15px 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>