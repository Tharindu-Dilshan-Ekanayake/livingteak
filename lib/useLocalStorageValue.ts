'use client'

import { useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener('local-storage', callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener('local-storage', callback)
  }
}

export default function useLocalStorageValue(key: string) {
  return useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(key),
    () => undefined
  )
}
