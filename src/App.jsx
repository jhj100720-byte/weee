import React, { useState } from 'react';
import { db } from './firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState('recommend');
  const [selectedMuscle, setSelectedMuscle] = useState('전체');
  const [selectedDifficulty, setSelectedDifficulty] = useState('초급 (입문자)');
  const [userInfo, setUserInfo] = useState({ weight: '', height: '', age: '' });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [muscleImageUrl, setMuscleImageUrl] = useState('');

  const muscleCategories = ['전체', '가슴', '등', '어깨', '하체', '팔', '복근/코어', '전신/유산소'];
  const difficultyLevels = [
    { label: '초급 (입문자)' },
    { label: '중급 (경험자)' },
    { label: '상급 (숙련자)' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfoprev => ({ ...userInfo, [name]: value });
  };

  const handleRecommendSubmit = async () => {
    if (!userInfo.weight || !userInfo.height || !userInfo.age) {
      alert('신체 정보(체중, 키, 연령)를 모두 입력해 주세요.');
      return;
    }

    setLoading(true);
    setResult('');
    setMuscleImageUrl('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'recommend',
          payload: {
            ...userInfo,
            targetCategory: selectedMuscle,
            difficulty: selectedDifficulty
          }
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data.text);
        if (data.imageUrl) setMuscleImageUrl(data.imageUrl);
      } else {
        setResult(`오류 발생: ${data.error}`);
      }
    } catch (err) {
      setResult('요청 중 통신 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0b1326] text-[#e2e2e6] font-sans antialiased h-screen overflow-hidden flex">
      {/* Sidebar Navigation */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-[#060e20] border-r border-[#44474e]/10 flex flex-col gap-3 p-6 shadow-xl z-50">
        <div className="mb-8 px-4">
          <span className="text-2xl font-bold text-[#9BCB3C]">AI 피트니스</span>
          <p className="text-[#c4c6cf] text-xs mt-1 opacity-60">Elite Membership</p>
        </div>
        
        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('recommend')}
            className={`flex items-center gap-3 px-4 py-3 rounded-full text-left font-medium transition-all ${
              activeTab === 'recommend' 
                ? 'bg-[#1F3F7A] text-white shadow-[0_0_20px_rgba(31,63,122,0.3)] font-bold' 
                : 'text-[#c4c6cf] hover:bg-[#31394d]/20'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
            <span>추천</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('routine')}
            className={`flex items-center gap-3 px-4 py-3 rounded-full text-left font-medium transition-all ${
              activeTab === 'routine' 
                ? 'bg-[#1F3F7A] text-white shadow-[0_0_20px_rgba(31,63,122,0.3)] font-bold' 
                : 'text-[#c4c6cf] hover:bg-[#31394d]/20'
            }`}
          >
            <span className="material-symbols-outlined">calendar_month</span>
            <span>루틴</span>
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-[#44474e]/10">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#31394d]/20 backdrop-blur-md border border-white/5">
            <div className="w-10 h-10 rounded-full bg-[#1F3F7A] flex items-center justify-center text-white font-bold">김</div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm">김철수 님</span>
              <span className="text-[#c4c6cf] text-xs opacity-60">Level 42</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Top Navigation Bar */}
      <header className="fixed top-0 right-0 left-64 h-16 bg-[#0b1326]/80 backdrop-blur-xl border-b border-[#44474e]/10 flex justify-between items-center px-8 z-40">
        <div>
          <h1 className="text-xl font-bold text-white">맞춤 운동 추천</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#31394d]/30 transition-colors">
            <span className="material-symbols-outlined text-[#c4c6cf]">notifications</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="ml-64 mt-16 p-8 h-[calc(100vh-64px)] overflow-y-auto relative w-full">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#1F3F7A]/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 -left-24 w-64 h-64 bg-[#9BCB3C]/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-4xl mx-auto space-y-6">
          {activeTab === 'recommend' && (
            <>
              {/* Target Body Part Selection Section */}
              <section className="bg-[#31394d]/20 backdrop-blur-xl border border-white/5 p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-[#9BCB3C]" style={{ fontVariationSettings: "'FILL' 1" }}>track_changes</span>
                  <h2 className="text-lg font-bold text-white">타겟 부위 선택</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {muscleCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedMuscle(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                        selectedMuscle === cat
                          ? 'bg-[#9BCB3C] text-[#0d1a00] shadow-[0_0_20px_rgba(155,203,60,0.3)] border border-transparent'
                          : 'bg-[#242d47] border border-[#44474e] text-[#c4c6cf] hover:border-[#9BCB3C]/50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </section>

              {/* Difficulty Selection */}
              <section className="bg-[#31394d]/20 backdrop-blur-xl border border-white/5 p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-[#9BCB3C]">bolt</span>
                  <h2 className="text-lg font-bold text-white">운동 난이도 선택</h2>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {difficultyLevels.map((level) => (
                    <button
                      key={level.label}
                      onClick={() => setSelectedDifficulty(level.label)}
                      className={`flex flex-col items-center justify-center gap-1 p-6 rounded-2xl transition-all relative overflow-hidden group ${
                        selectedDifficulty === level.label
                          ? 'bg-[#9BCB3C]/10 border-2 border-[#9BCB3C] text-[#9BCB3C] font-bold'
                          : 'bg-[#242d47] border border-[#44474e] text-[#c4c6cf] hover:border-[#9BCB3C]/50'
                      }`}
                    >
                      <span className="text-base relative z-10">{level.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-xl bg-[#9BCB3C]/5 border border-[#9BCB3C]/20 flex items-center gap-3 text-[#9BCB3C] font-medium text-sm">
                  <span className="material-symbols-outlined text-[18px]">info</span>
                  <span>선택 범위: {selectedMuscle} | 선택 난이도: {selectedDifficulty}</span>
                </div>
              </section>

              {/* Physical Information Section */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <section className="md:col-span-8 bg-[#31394d]/20 backdrop-blur-xl border border-white/5 p-6 rounded-3xl flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-[#1F3F7A]">monitoring</span>
                    <h2 className="text-lg font-bold text-white">신체 정보 입력</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#c4c6cf] opacity-80 px-1">체중 (kg)</label>
                      <input
                        type="number"
                        name="weight"
                        value={userInfo.weight}
                        onChange={(e) => setUserInfo({...userInfo, weight: e.target.value})}
                        className="w-full bg-[#060e20] border border-[#44474e] rounded-xl p-4 text-white focus:outline-none focus:border-[#1F3F7A]"
                        placeholder="예: 70"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#c4c6cf] opacity-80 px-1">키 (cm)</label>
                      <input
                        type="number"
                        name="height"
                        value={userInfo.height}
                        onChange={(e) => setUserInfo({...userInfo, height: e.target.value})}
                        className="w-full bg-[#060e20] border border-[#44474e] rounded-xl p-4 text-white focus:outline-none focus:border-[#1F3F7A]"
                        placeholder="예: 175"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#c4c6cf] opacity-80 px-1">연령 (세)</label>
                      <input
                        type="number"
                        name="age"
                        value={userInfo.age}
                        onChange={(e) => setUserInfo({...userInfo, age: e.target.value})}
                        className="w-full bg-[#060e20] border border-[#44474e] rounded-xl p-4 text-white focus:outline-none focus:border-[#1F3F7A]"
                        placeholder="예: 25"
                      />
                    </div>
                  </div>
                </section>

                <div className="md:col-span-4 rounded-3xl overflow-hidden bg-[#31394d]/20 backdrop-blur-xl border border-white/5 flex items-center justify-center relative min-h-[300px]">
                  <div className="relative z-10 text-center p-6 flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[#1F3F7A]/30 flex items-center justify-center border border-[#1F3F7A] animate-pulse">
                      <span className="material-symbols-outlined text-[#9BCB3C] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                    </div>
                    <p className="text-lg font-bold text-white drop-shadow-md">AI 기반<br />신체 분석</p>
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-4 pb-10">
                <button
                  onClick={handleRecommendSubmit}
                  disabled={loading}
                  className="w-full py-5 rounded-full bg-[#9BCB3C] text-[#0d1a00] font-bold text-lg shadow-[0_0_30px_rgba(155,203,60,0.4)] hover:shadow-[0_0_50px_rgba(155,203,60,0.6)] transition-all duration-300 cursor-pointer"
                >
                  {loading ? 'AI가 맞춤 루틴을 생성하는 중...' : `'${selectedDifficulty}' 맞춤 운동 추천받기`}
                </button>
              </div>

              {result && (
                <div className="bg-[#31394d]/20 backdrop-blur-xl border border-white/5 p-6 rounded-3xl space-y-4 mb-20">
                  <h3 className="text-lg font-bold text-[#9BCB3C]">🤖 AI 맞춤 운동 추천 결과</h3>
                  {muscleImageUrl && (
                    <div className="text-center">
                      <img src={muscleImageUrl} alt="타겟 근육 시각화" className="max-w-full h-auto rounded-2xl mx-auto border border-[#44474e]" />
                    </div>
                  )}
                  <p className="whitespace-pre-line leading-relaxed text-sm text-[#e2e2e6]">{result}</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'routine' && (
            <div className="bg-[#31394d]/25 backdrop-blur-xl border border-white/5 p-8 rounded-3xl">
              <h2 className="text-xl font-bold text-white mb-4">📅 요일별 운동 루틴 관리</h2>
              <p className="text-[#c4c6cf]">맞춤 운동 추천 결과를 저장하고 요일별 루틴을 관리할 수 있습니다.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
