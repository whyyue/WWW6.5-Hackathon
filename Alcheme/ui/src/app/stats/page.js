'use client';
import { useState, useEffect } from 'react';

export default function Stats() {
  const [stats, setStats] = useState(null);

  // ================================
  // 【接口】获取用户成长数据
  // GET /api/stats
  // ================================
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('https://22bcdad4-a6ad-4285-adac-6e7d7e867c52-00-2rkqab45ars9.janeway.replit.dev/api/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setStats({
          radar: [85, 70, 90, 65, 80, 75],
          heat: [5, 3, 7, 2, 8, 4, 6],
          totalOres: 24,
          totalCards: 6,
          totalMedals: 2,
        });
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <main className="min-h-screen bg-black text-white p-6">加载中...</main>;

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-400 mb-6">📊 成长数据</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl mb-4">六维成长雷达</h2>
            <div className="h-60 bg-gray-700 rounded-lg flex items-center justify-center">
              智慧：{stats.radar[0]} | 创造：{stats.radar[1]} | 韧性：{stats.radar[2]}
              <br/>
              社交：{stats.radar[3]} | 技术：{stats.radar[4]} | 感知：{stats.radar[5]}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl mb-4">近7天活跃</h2>
            <div className="h-60 bg-gray-700 rounded-lg flex items-center justify-center">
              {stats.heat.map((val, i) => (
                <div key={i} className="mx-2 text-center">
                  <div className="w-8 h-12 bg-purple-500 rounded-md" style={{ height: val * 8 + 'px' }}></div>
                  <div className="text-xs mt-1">{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-2xl font-bold">{stats.totalOres}</div>
              <div className="text-sm text-gray-400">矿石总数</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalCards}</div>
              <div className="text-sm text-gray-400">卡片总数</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalMedals}</div>
              <div className="text-sm text-gray-400">勋章总数</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
