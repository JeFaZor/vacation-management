import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import RequestForm from '../../../src/components/requester/RequestForm.vue'
import type { VacationRequest } from '../../../src/types'

const submitRequestMock = vi.fn()

vi.mock('../../../src/services/api', () => ({
  submitRequest: (...args: unknown[]) => submitRequestMock(...args),
}))

function isoOffsetDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const FAKE_CREATED: VacationRequest = {
  id: 99,
  startDate: '2030-06-01',
  endDate: '2030-06-05',
  reason: 'Family trip',
  status: 'Pending',
  comments: null,
  createdAt: '2030-01-01T00:00:00.000Z',
  updatedAt: '2030-01-01T00:00:00.000Z',
  user: { id: 1, name: 'Lior', role: 'Requester' },
  validator: null,
}

describe('RequestForm', () => {
  beforeEach(() => {
    submitRequestMock.mockReset()
  })

  it('blocks submission and shows an error when startDate is in the past', async () => {
    const wrapper = mount(RequestForm)
    await wrapper.find('#startDate').setValue(isoOffsetDays(-5))
    await wrapper.find('#endDate').setValue(isoOffsetDays(2))
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(submitRequestMock).not.toHaveBeenCalled()
    expect(wrapper.find('#startDate-error').text()).toMatch(/past/i)
  })

  it('blocks submission and shows an error when endDate is before startDate', async () => {
    const wrapper = mount(RequestForm)
    await wrapper.find('#startDate').setValue(isoOffsetDays(10))
    await wrapper.find('#endDate').setValue(isoOffsetDays(3))
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(submitRequestMock).not.toHaveBeenCalled()
    expect(wrapper.find('#endDate-error').text()).toMatch(/start date/i)
  })

  it('calls submitRequest with the correct payload and emits "created" on valid input', async () => {
    submitRequestMock.mockResolvedValue(FAKE_CREATED)
    const start = isoOffsetDays(7)
    const end = isoOffsetDays(10)

    const wrapper = mount(RequestForm)
    await wrapper.find('#startDate').setValue(start)
    await wrapper.find('#endDate').setValue(end)
    await wrapper.find('#reason').setValue('  Family trip  ')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(submitRequestMock).toHaveBeenCalledTimes(1)
    expect(submitRequestMock).toHaveBeenCalledWith({
      startDate: start,
      endDate: end,
      reason: 'Family trip',
    })
    expect(wrapper.emitted('created')).toBeTruthy()
    expect(wrapper.emitted('created')?.[0]).toEqual([FAKE_CREATED])
  })
})
