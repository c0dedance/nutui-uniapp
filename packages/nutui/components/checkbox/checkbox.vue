<script setup lang="ts">
import type { ComputedRef } from 'vue'
import { computed, defineComponent, getCurrentInstance, onBeforeUnmount, onMounted, reactive, toRef, useSlots, watch } from 'vue'
import { getMainClass, pxCheck } from '../_utils'
import { CHANGE_EVENT, PREFIX, UPDATE_MODEL_EVENT } from '../_constants'
import NutIcon from '../icon/icon.vue'
import { useInject } from '../_hooks'
import { useFormDisabled } from '../form/form'
import { CHECKBOX_KEY, checkboxEmits, checkboxProps } from './checkbox'

const props = defineProps(checkboxProps)
const emit = defineEmits(checkboxEmits)
const slots = useSlots()
const disabled = useFormDisabled(toRef(props, 'disabled'))
const { parent } = useInject<{
  value: ComputedRef<any[]>
  disabled: ComputedRef<boolean>
  max: ComputedRef<number>
  updateValue: (value: string[]) => void
}>(CHECKBOX_KEY)
const state = reactive({
  partialSelect: props.indeterminate,
})

const hasParent = computed(() => !!parent)

const pValue = computed(() => {
  if (hasParent.value)
    return parent?.value.value.includes(props.label)

  else
    return props.modelValue
})
const pDisabled = computed(() => {
  return hasParent.value ? (parent?.disabled.value ? parent.disabled.value : disabled.value) : disabled.value
})

const checked = computed(() => !!props.modelValue)

const color = computed(() => {
  return !pDisabled.value
    ? state.partialSelect
      ? 'nut-checkbox__icon--indeterminate'
      : !pValue.value
          ? 'nut-checkbox__icon--unchecked'
          : 'nut-checkbox__icon'
    : 'nut-checkbox__icon--disable'
})

const classes = computed(() => {
  return getMainClass(props, componentName, {
    [`${componentName}--reverse`]: props.textPosition === 'left',
  })
})

const getLabelClass = computed(() => {
  return `${componentName}__label ${pDisabled.value ? `${componentName}__label--disabled` : ''}`
})

const getButtonClass = computed(() => {
  return `${componentName}__button ${pValue.value && `${componentName}__button--active`} ${pDisabled.value ? `${componentName}__button--disabled` : ''
    }`
})

let updateType = ''

function emitChange(value: string | boolean, label?: string) {
  updateType = 'click'
  emit(UPDATE_MODEL_EVENT, value)
  emit(CHANGE_EVENT, value, label!)
}

watch(
  () => props.modelValue,
  (v) => {
    if (updateType === 'click')
      updateType = ''

    else
      emit(CHANGE_EVENT, v)
  },
)

function handleClick() {
  if (pDisabled.value)
    return
  if (checked.value && state.partialSelect) {
    // TODO uniapp小程序拿不到slots的children https://github.com/dcloudio/uni-app/issues/3279
    state.partialSelect = false
    // #ifdef H5
    emitChange(checked.value, slots.default?.()[0].children as string)
    // #endif
    // #ifndef H5
    emitChange(checked.value, props.label)
    // #endif

    return
  }

  // #ifdef H5
  emitChange(!checked.value, slots.default?.()[0].children as string)
  // #endif
  // #ifndef H5
  emitChange(!checked.value, props.label)
  // #endif

  if (hasParent.value) {
    const value = parent?.value.value
    const max = parent?.max.value
    const { label } = props
    const index = value!.indexOf(label)
    if (index > -1)
      value?.splice(index, 1)
    else if (index <= -1 && (value!.length < max! || !max))
      value?.push(label)

    parent?.updateValue(value!)
  }
}

onMounted(() => {
  hasParent.value && parent?.add(getCurrentInstance()!)
})

onBeforeUnmount(() => {
  hasParent.value && parent?.remove(getCurrentInstance()!)
})

watch(
  () => props.indeterminate,
  (newVal) => {
    state.partialSelect = newVal
  },
)
</script>

<script lang="ts">
const componentName = `${PREFIX}-checkbox`

export default defineComponent({
  name: componentName,
  options: {
    virtualHost: true,
    addGlobalClass: true,
    styleIsolation: 'shared',
  },
})
</script>

<template>
  <view :class="classes" :style="customStyle" @click="handleClick">
    <view v-if="shape === 'button'" :class="getButtonClass">
      <slot />
    </view>

    <template v-else>
      <slot v-if="state.partialSelect" name="indeterminate">
        <NutIcon
          name="check-disabled" :size="pxCheck(iconSize)" :width="pxCheck(iconSize)" :height="pxCheck(iconSize)"
          :pop-class="color"
        />
      </slot>
      <slot v-else-if="!pValue" name="icon">
        <NutIcon
          name="check-normal" :size="pxCheck(iconSize)" :width="pxCheck(iconSize)" :height="pxCheck(iconSize)"
          :pop-class="color"
        />
      </slot>
      <slot v-else name="checkedIcon">
        <NutIcon
          name="checked" :size="pxCheck(iconSize)" :width="pxCheck(iconSize)" :height="pxCheck(iconSize)"
          :pop-class="color"
        />
      </slot>
      <view :class="getLabelClass">
        <slot />
      </view>
    </template>
  </view>
</template>

<style lang="scss">
@import './index';
</style>
