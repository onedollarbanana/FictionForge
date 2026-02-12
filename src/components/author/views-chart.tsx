'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'

interface DailyViews {
  date: string
  views: number
}

interface ViewsChartProps {
  authorId: string
}

export function ViewsChart({ authorId }: ViewsChartProps) {
  const [data, setData] = useState<DailyViews[]>([])
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const supabase = createClient()
      
      const { data: viewsData, error } = await supabase.rpc('get_author_daily_views', {
        author_uuid: authorId,
        num_days: days
      })

      if (error) {
        console.error('Error fetching views:', error)
        // Fallback to empty data structure
        const emptyData: DailyViews[] = []
        const now = new Date()
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(date.getDate() - i)
          emptyData.push({
            date: date.toISOString().split('T')[0],
            views: 0
          })
        }
        setData(emptyData)
      } else {
        setData(viewsData || [])
      }
      setLoading(false)
    }

    fetchData()
  }, [authorId, days])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const totalViews = data.reduce((sum, d) => sum + d.views, 0)

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Views Over Time</h3>
            <p className="text-sm text-zinc-500">{totalViews.toLocaleString()} views in the last {days} days</p>
          </div>
        </div>
        <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                days === d
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-zinc-500">
          No view data available
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
                className="text-zinc-500"
                interval={days === 7 ? 0 : days === 30 ? 4 : 13}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-zinc-500"
                allowDecimals={false}
              />
              <Tooltip
                labelFormatter={(label) => formatDate(label as string)}
                formatter={(value) => [Number(value ?? 0).toLocaleString(), 'Views']}
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #fff)',
                  border: '1px solid var(--tooltip-border, #e4e4e7)',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={days <= 30}
                activeDot={{ r: 6, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
