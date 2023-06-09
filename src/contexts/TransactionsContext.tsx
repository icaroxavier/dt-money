import { ReactNode, useState, useEffect, useCallback } from 'react'
import { api } from '../lib/axios'
import { createContext } from 'use-context-selector'

interface Transaction {
  id: number
  description: string
  type: 'income' | 'outcome'
  category: string
  price: number
  createdAt: string
}

interface TransactionContextProviderProps {
  children: ReactNode
}

interface AddTransactionsParams {
  description: string
  type: 'income' | 'outcome'
  category: string
  price: number
}

interface ITransactionsContext {
  transactions: Transaction[]
  fetchTransactions: (query?: string) => Promise<void>
  addTransaction: (transaction: AddTransactionsParams) => void
}

export const TransactionsContext = createContext<ITransactionsContext>(
  {} as ITransactionsContext,
)

export function TransactionsContextProvider({
  children,
}: TransactionContextProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const addTransaction = useCallback(
    async (transaction: AddTransactionsParams) => {
      const response = await api.post('/transactions', {
        ...transaction,
        createdAt: new Date(),
      })
      setTransactions((state) => {
        return [response.data, ...state]
      })
    },
    [setTransactions],
  )

  const fetchTransactions = useCallback(
    async (query?: string) => {
      const response = await api.get('/transactions', {
        params: {
          q: query,
          _sort: 'createdAt',
          _order: 'desc',
        },
      })
      setTransactions(response.data)
    },
    [setTransactions],
  )

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return (
    <TransactionsContext.Provider
      value={{ transactions, fetchTransactions, addTransaction }}
    >
      {children}
    </TransactionsContext.Provider>
  )
}
