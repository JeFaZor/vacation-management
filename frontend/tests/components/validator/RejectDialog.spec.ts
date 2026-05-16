import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import RejectDialog from '../../../src/components/validator/RejectDialog.vue'
import type { VacationRequest } from '../../../src/types'

const STUB_REQUEST: VacationRequest = {
  id: 1,
  startDate: '2030-06-01',
  endDate: '2030-06-05',
  reason: null,
  status: 'Pending',
  comments: null,
  createdAt: '2030-01-01T00:00:00.000Z',
  updatedAt: '2030-01-01T00:00:00.000Z',
  user: { id: 1, name: 'Lior', role: 'Requester' },
  validator: null,
}

function findConfirmButton(): HTMLButtonElement | null {
  const buttons = Array.from(document.body.querySelectorAll('button'))
  return (
    buttons.find((b) => b.textContent?.trim() === 'Confirm reject') as
      | HTMLButtonElement
      | undefined
  ) ?? null
}

async function typeInComments(text: string) {
  const ta = document.body.querySelector('#reject-comments') as HTMLTextAreaElement
  ta.value = text
  ta.dispatchEvent(new Event('input', { bubbles: true }))
  await flushPromises()
}

describe('RejectDialog', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('disables Confirm reject when comments are empty', async () => {
    mount(RejectDialog, {
      attachTo: document.body,
      props: { open: true, request: STUB_REQUEST, submitting: false },
    })
    await flushPromises()

    const btn = findConfirmButton()
    expect(btn).not.toBeNull()
    expect(btn?.disabled).toBe(true)
  })

  it('enables Confirm reject once non-empty comments are typed', async () => {
    mount(RejectDialog, {
      attachTo: document.body,
      props: { open: true, request: STUB_REQUEST, submitting: false },
    })
    await flushPromises()

    await typeInComments('Insufficient coverage during requested period.')

    const btn = findConfirmButton()
    expect(btn?.disabled).toBe(false)
  })

  it('emits "confirm" with the trimmed comments string when confirmed', async () => {
    const wrapper = mount(RejectDialog, {
      attachTo: document.body,
      props: { open: true, request: STUB_REQUEST, submitting: false },
    })
    await flushPromises()

    await typeInComments('  Insufficient coverage  ')

    findConfirmButton()?.click()
    await flushPromises()

    expect(wrapper.emitted('confirm')).toBeTruthy()
    expect(wrapper.emitted('confirm')?.[0]).toEqual(['Insufficient coverage'])
  })
})
