import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusFilter from '../../../src/components/validator/StatusFilter.vue'

const COUNTS = { All: 9, Pending: 3, Approved: 4, Rejected: 2 }

describe('StatusFilter', () => {
  it('marks the active tab with aria-selected and the active pill class', () => {
    const wrapper = mount(StatusFilter, {
      props: { modelValue: 'Pending', counts: COUNTS },
    })

    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs).toHaveLength(4)

    const labels = tabs.map((t) => t.text().replace(/\s+/g, ' ').trim())
    const pendingIdx = labels.findIndex((t) => t.startsWith('Pending'))
    const allIdx = labels.findIndex((t) => t.startsWith('All'))

    expect(tabs[pendingIdx].attributes('aria-selected')).toBe('true')
    expect(tabs[pendingIdx].classes()).toContain('bg-primary-50')

    expect(tabs[allIdx].attributes('aria-selected')).toBe('false')
    expect(tabs[allIdx].classes()).not.toContain('bg-primary-50')
  })

  it('renders count badges with values from the counts prop', () => {
    const wrapper = mount(StatusFilter, {
      props: { modelValue: 'All', counts: COUNTS },
    })

    const tabs = wrapper.findAll('[role="tab"]')
    const badgeText = (idx: number) =>
      tabs[idx].find('span:last-child').text().trim()

    const labels = tabs.map((t) => t.text().replace(/\s+/g, ' ').trim())
    const idxFor = (prefix: string) => labels.findIndex((t) => t.startsWith(prefix))

    expect(badgeText(idxFor('All'))).toBe('9')
    expect(badgeText(idxFor('Pending'))).toBe('3')
    expect(badgeText(idxFor('Approved'))).toBe('4')
    expect(badgeText(idxFor('Rejected'))).toBe('2')
  })
})
