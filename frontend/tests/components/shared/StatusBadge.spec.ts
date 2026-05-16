import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBadge from '../../../src/components/shared/StatusBadge.vue'

describe('StatusBadge', () => {
  it('renders Pending with amber styling', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'Pending' } })
    expect(wrapper.text()).toContain('Pending')
    expect(wrapper.element.className).toContain('bg-amber-50')
    expect(wrapper.element.className).toContain('text-amber-700')
  })

  it('renders Approved with emerald styling', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'Approved' } })
    expect(wrapper.text()).toContain('Approved')
    expect(wrapper.element.className).toContain('bg-emerald-50')
    expect(wrapper.element.className).toContain('text-emerald-700')
  })

  it('renders Rejected with rose styling', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'Rejected' } })
    expect(wrapper.text()).toContain('Rejected')
    expect(wrapper.element.className).toContain('bg-rose-50')
    expect(wrapper.element.className).toContain('text-rose-700')
  })
})
