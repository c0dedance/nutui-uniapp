import type { ExtractPropTypes } from 'vue'
import { isString, makeArrayProp, makeStringProp } from '../_utils'

export interface ChildType {
  catName?: string
  catType?: number
  [key: string]: any
}
export interface CustomType {
  catName?: string
  [key: string]: any
}
export const categorypaneProps = {
  /**
   * @description 分类模式：`classify`，`text`，`custom`
   */
  type: makeStringProp<'classify' | 'text' | 'custom'>('classify'),

  /**
   * @description 右侧展示当前分类数据
   */
  categoryChild: makeArrayProp<any>([]),

  /**
   * @description 自定义分类数据
   */
  customCategory: makeArrayProp<any>([]),
}

export type CategoryPaneProps = ExtractPropTypes<typeof categorypaneProps>

export const categorypaneEmits = {
  onChange: (sku: string) => isString(sku),
}

export type CategoryPaneEmits = typeof categorypaneEmits
