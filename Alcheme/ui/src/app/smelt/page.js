'use client';
import { useState, useEffect } from 'react';

export default function Smelt() {
  const [ores, setOres] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // ================================
  // 【接口 1】获取我的所有矿石
  // GET /api/ores
  // ================================
  useEffect(() => {
    const fetchOres = async () => {
      try {
        const res = await fetch('https://22bcdad4-a6ad-4285-adac-6e7d7e867c52-00-2rkqab45ars9.janeway.replit.dev/api/ores');
        const data = await res.json();
        setOres(data);
      } catch (err) {
        setOres([
          { id: 1, title: "学习3小时", dimension: "智慧" },
          { id: 2, title: "运动30分钟", dimension: "韧性" },
          { id: 3, title: "阅读一本书", dimension: "感知" },
        ]);
      }
    };
    fetchOres();
  }, []);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // ================================
  // 【接口 2】合成卡片（提交选中的矿石）
  // POST /api/smelt
  // ================================
  const handleSmelt = async () => {
    if (selectedIds.length === 0) {
      alert("请至少选择一个矿石");
      return;
    }

    try {
      const res = await fetch('https://22bcdad4-a6ad-4285-adac-6e7d7e867c52-00-2rkqab45ars9.janeway.replit.dev/api/smelt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oreIds: selectedIds }),
      });

      const result = await res.json();
      alert("合成成功！卡片ID：" + result.cardId);
      setSelectedIds([]);
    } catch (err) {
      alert("演示模式：合成成功！");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-400 mb-6">🔥 成长炼金</h1>

        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl mb-4">选择要合成的矿石</h2>
          {ores.map(ore => (
            <div
              key={ore.id}
              onClick={() => toggleSelect(ore.id)}
              className={`p-4 rounded-lg mb-2 cursor-pointer ${
                selectedIds.includes(ore.id) ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              {ore.title}
            </div>
          ))}
        </div>

        <button
          onClick={handleSmelt}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl text-xl font-bold"
        >
          开始合成里程碑卡片
        </button>
      </div>
    </main>
  );
}
