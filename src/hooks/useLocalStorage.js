import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  // ローカルストレージから値を取得するか、初期値を使用
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // 値を設定する関数
  const setValue = (value) => {
    try {
      // 値が関数の場合は前の値を渡して実行
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // 状態を更新
      setStoredValue(valueToStore)
      
      // ローカルストレージに保存
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}
