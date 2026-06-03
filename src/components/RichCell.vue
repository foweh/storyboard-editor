<script setup lang="ts">
/**
 * 可编辑单元格
 * - rich=true → contenteditable 富文本编辑器 + 浮动工具栏
 * - type='number' → 数字输入
 * - 默认 → 纯文本输入
 * - 单击进入编辑，回车保存（富文本 Shift+Enter 换行）
 */
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  modelValue: string | number
  rich?: boolean
  type?: 'text' | 'number'
}>()

/** 富文本内容是否含换行 → 取消截断，自动撑高 */
const hasBr = computed(() => {
  const v = String(props.modelValue ?? '')
  return v.includes('<br>') || v.includes('\n')
})

const emit = defineEmits<{ 'update:modelValue': [string | number] }>()

const editing = ref(false)
const editVal = ref('')

// 编辑器 ref
const inputRef = ref<HTMLInputElement | null>(null)
const textRef = ref<HTMLTextAreaElement | null>(null)
const richRef = ref<HTMLDivElement | null>(null)

const cellRef = ref<HTMLDivElement | null>(null)
const showBar = ref(false)
const barPos = ref({ top: 0, left: 0 })

function exec(cmd: string, val?: string) {
  document.execCommand(cmd, false, val)
  if (richRef.value) {
    editVal.value = richRef.value.innerHTML
    richRef.value.focus()
  }
}

function open(e?: MouseEvent) {
  if (editing.value) return
  editing.value = true
  editVal.value = String(props.modelValue ?? '')
  showBar.value = !!(props.rich)

  nextTick(() => {
    if (props.rich && richRef.value) {
      richRef.value.innerHTML = editVal.value || ''
      richRef.value.focus()
      if (e?.target) {
        const r = (e.target as HTMLElement).getBoundingClientRect()
        barPos.value = { top: r.top - 44, left: Math.max(0, r.left) }
      }
    } else if (props.type === 'number' && inputRef.value) {
      inputRef.value.focus()
    } else if (textRef.value) {
      textRef.value.focus()
    }
  })
}

function close() {
  editing.value = false
  showBar.value = false

  let val: string | number
  if (props.type === 'number') {
    val = parseFloat(editVal.value) || 0
  } else if (props.rich && richRef.value) {
    const h = richRef.value.innerHTML
    val = (h === '<br>' || !h) ? '' : h
  } else {
    val = editVal.value
  }
  emit('update:modelValue', val)
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey && !props.rich) {
    e.preventDefault()
    close()
  }
  if (e.key === 'Escape') {
    editing.value = false
    showBar.value = false
  }
}

function onBlur() {
  setTimeout(() => {
    if (!editing.value) return
    // 如果焦点移到工具栏，不关闭
    if (document.activeElement?.closest('.rich-toolbar')) return
    if (props.rich && richRef.value) editVal.value = richRef.value.innerHTML
    close()
  }, 180)
}

function onDocClick(e: MouseEvent) {
  if (!editing.value) return
  const t = e.target as HTMLElement
  // 点击在工具栏上 → 不处理
  if (t.closest('.rich-toolbar')) return
  // 点击在当前单元格内 → 不处理
  if (cellRef.value?.contains(t)) return
  // 点击在其他任何地方（包括其他单元格）→ 关闭
  if (props.rich && richRef.value) editVal.value = richRef.value.innerHTML
  close()
}

onMounted(() => document.addEventListener('mousedown', onDocClick))
onUnmounted(() => document.removeEventListener('mousedown', onDocClick))
</script>

<template>
  <div ref="cellRef" :class="['rich-cell', { editing }]" @click="open">
    <!-- ── 编辑模式 ── -->
    <template v-if="editing">
      <input
        v-if="type === 'number'"
        ref="inputRef"
        v-model="editVal"
        type="number"
        class="cell-inp"
        @keydown="onKey"
        @blur="onBlur"
      />
      <textarea
        v-else-if="!rich"
        ref="textRef"
        v-model="editVal"
        class="cell-inp cell-ta"
        rows="1"
        @keydown="onKey"
        @blur="onBlur"
      />
      <div v-else class="rich-wrap">
        <div
          ref="richRef"
          class="rich-editor c-editable"
          contenteditable="true"
          @input="editVal = richRef!.innerHTML"
          @keydown="onKey"
          @blur="onBlur"
        />
        <Teleport to="body">
          <div
            v-if="showBar"
            class="rich-toolbar"
            :style="{ top: barPos.top + 'px', left: barPos.left + 'px' }"
            @mousedown.prevent
          >
            <button title="加粗 (Ctrl+B)" @click="exec('bold')"><b>B</b></button>
            <button title="斜体 (Ctrl+I)" @click="exec('italic')"><i>I</i></button>
            <button title="下划线 (Ctrl+U)" @click="exec('underline')"><u>U</u></button>
            <span class="tb-div" />
            <button title="标题" @click="exec('formatBlock', 'h3')">H</button>
            <span class="tb-div" />
            <button title="无序列表" @click="exec('insertUnorderedList')">≡</button>
            <button title="有序列表" @click="exec('insertOrderedList')">#</button>
            <span class="tb-div" />
            <button title="清除格式" @click="exec('removeFormat')">✕</button>
          </div>
        </Teleport>
      </div>
    </template>

    <!-- ── 预览模式 ── -->
    <template v-else>
      <span
        v-if="rich"
        class="cell-pv"
        :class="{ empty: !modelValue, 'cell-pv-multi': hasBr }"
        v-html="String(modelValue) || '—'"
      />
      <span
        v-else
        class="cell-pv"
        :class="{ empty: modelValue === '' || modelValue === 0 }"
      >
        {{ modelValue !== 0 ? (modelValue || '—') : 0 }}
      </span>
    </template>
  </div>
</template>

<style scoped>
.rich-cell {
  min-height: 30px;
  width: 100%;
  flex: 1;
  align-self: stretch;
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: text;
  transition: background 0.1s;
  user-select: auto;
}

.rich-cell:hover { background: var(--bg-hover); }
.rich-cell.editing { padding: 0; background: transparent; z-index: 20; position: relative; }
.rich-cell.editing:hover { background: transparent; }

/* 输入控件 */
.cell-inp {
  width: 100%;
  padding: 3px 6px;
  border: 1.5px solid var(--accent);
  border-radius: 4px;
  font-size: 12px;
  font-family: inherit;
  outline: none;
  background: #fff;
  box-shadow: 0 0 0 3px var(--accent-light);
}

.cell-ta {
  resize: none;
  min-height: 26px;
  line-height: 1.4;
}

/* 富文本 */
.rich-wrap { width: 100%; position: relative; }

.rich-editor {
  min-height: 26px;
  max-height: 120px;
  overflow-y: auto;
  padding: 3px 6px;
  border: 1.5px solid var(--accent);
  border-radius: 4px;
  font-size: 12px;
  font-family: inherit;
  outline: none;
  background: #fff;
  box-shadow: 0 0 0 3px var(--accent-light);
  line-height: 1.5;
  word-break: break-word;
}

.rich-editor:empty::before { content: '输入…'; color: #cbd5e1; }

/* 预览 */
.cell-pv {
  font-size: 12px;
  line-height: 1.4;
  color: var(--text);
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  max-width: 100%;
  pointer-events: none;
}

/* 含换行的富文本 → 不截断，自动撑高 */
.cell-pv-multi {
  display: block;
  -webkit-line-clamp: unset;
  -webkit-box-orient: unset;
  overflow: visible;
  text-overflow: clip;
}

.cell-pv :deep(p) { margin: 2px 0; }
.cell-pv :deep(ul), .cell-pv :deep(ol) { padding-left: 16px; margin: 2px 0; }
.cell-pv :deep(h3) { font-size: 12.5px; font-weight: 700; margin: 3px 0 1px; }
.cell-pv :deep(b), .cell-pv :deep(strong) { font-weight: 600; }
.cell-pv :deep(i), .cell-pv :deep(em) { font-style: italic; }

.cell-pv.empty { color: #cbd5e1; }
</style>

<style>
.rich-toolbar {
  position: fixed;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 6px;
  background: #1e293b;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  animation: tb-in 0.1s ease-out;
}

@keyframes tb-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.rich-toolbar button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 24px;
  border: none;
  background: transparent;
  color: #cbd5e1;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.1s;
}

.rich-toolbar button:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.rich-toolbar button:active {
  background: rgba(255,255,255,0.18);
}

.tb-div {
  width: 1px;
  height: 16px;
  background: rgba(255,255,255,0.1);
  margin: 0 2px;
}
</style>
