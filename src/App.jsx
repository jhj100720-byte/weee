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

  // 운동 도사전 상태 관리
  const [selectedDictCategory, setSelectedDictCategory] = useState('가슴');
  const [selectedExercise, setSelectedExercise] = useState(null);

  // 운동 목록 및 상세 자세 데이터베이스
  const exerciseDictionary = {
    '가슴': [
      {
        name: '벤치 프레스 (Bench Press)',
        target: '가슴 전체, 삼두근, 전면 삼각근',
        difficulty: '중급',
        description: '대표적인 상체 운동으로 바벨을 이용해 대흉근 전반의 근육량을 늘리는 데 탁월합니다.',
        steps: [
          '벤치에 누워 눈이 바벨 바로 아래에 오도록 위치합니다.',
          '어깨너비보다 약간 넓게 바를 잡고 랙에서 들어 올립니다.',
          '가슴 중앙(유두선 부근)으로 천천히 바를 내립니다.',
          '가슴이 늘어나는 느낌을 받으며 숨을 내쉬며 밀어 올립니다.'
        ],
        tips: '허리가 과도하게 아치형이 되지 않도록 주의하고, 손목이 꺾이지 않게 일자로 유지하세요.'
      },
      {
        name: '푸시업 (Push-up)',
        target: '가슴, 코어, 삼두근',
        difficulty: '초급',
        description: '맨몸으로 할 수 있는 가장 효과적인 상체 운동으로 코어 안정성도 함께 향상됩니다.',
        steps: [
          '엎드린 상태에서 손을 어깨너비보다 약간 넓게 짚습니다.',
          '머리부터 발끝까지 일직선을 유지합니다.',
          '팔꿈치가 몸통에서 약 45도 정도 벌어지도록 하며 몸을 내립니다.',
          '바닥을 밀어내며 원래 자세로 돌아옵니다.'
        ],
        tips: '엉덩이가 들리거나 허리가 꺾이지 않도록 복부에 지속적인 긴장을 유지하세요.'
      }
    ],
    '등': [
      {
        name: '랫 풀다운 (Lat Pulldown)',
        target: '광배근, 상완이두근',
        difficulty: '초급',
        description: '턱걸이가 어려운 초보자도 등 상부와 광배근을 효과적으로 자극할 수 있는 머신 운동입니다.',
        steps: [
          '머신에 앉아 패브릭 허벅지를 고정하고 바를 넓게 잡습니다.',
          '가슴을 살짝 위로 열어주며 시선은 상단을 향합니다.',
          '팔꿈치를 바닥 쪽으로 끌어내린다는 느낌으로 바를 쇄골 쪽으로 당깁니다.',
          '저항을 느끼며 천천히 팔을 원위치로 보냅니다.'
        ],
        tips: '팔의 힘으로만 당기지 말고, 등 뒤쪽 날개뼈가 모이는 느낌에 집중하세요.'
      },
      {
        name: '바벨 벤트오버 로우 (Barbell Bent-over Row)',
        target: '등 중부, 광배근',
        difficulty: '중급',
        description: '등 전체의 두께감과 너비를 동시에 키워주는 핵심 복합 관절 운동입니다.',
        steps: [
          '발을 어깨너비로 벌리고 서서 상체를 약 45도 숙입니다.',
          '언더핸드 또는 오버핸드 그립으로 바벨을 잡습니다.',
          '하복부나 배꼽 쪽을 향해 바벨을 당겨줍니다.',
          '등의 수축을 느끼며 천천히 바를 내립니다.'
        ],
        tips: '운동 중 허리가 둥글게 말리지 않도록 복근에 힘을 주고 척추 정렬을 유지하세요.'
      }
    ],
    '어깨': [
      {
        name: '오버헤드 프레스 (Overhead Press)',
        target: '전면/측면 삼각근, 상체 코어',
        difficulty: '중급',
        description: '어깨 전반의 크기와 상체 전신 근력을 키워주는 대표적인 프리웨이트 운동입니다.',
        steps: [
          '바벨을 쇄골 앞쪽에 위치시키고 어깨너비로 잡습니다.',
          '복부와 엉덩이에 힘을 준 상태로 머리 위 수직 방향으로 바를 밀어 올립니다.',
          '팔을 완전히 펴며 머리가 바벨 아래로 살짝 들어오게 합니다.',
          '천천히 쇄골 위치로 바를 내립니다.'
        ],
        tips: '허리를 뒤로 젖히면서 밀어 올리면 부상 위험이 있으니 복압을 단단히 유지하세요.'
      }
    ],
    '하체': [
      {
        name: '바벨 스쿼트 (Barbell Squat)',
        target: '대퇴사두근, 둔근, 코er',
        difficulty: '중급',
        description: '하체 운동의 왕이라 불리며 전신 근육 발달과 코어 강화에 필수적인 운동입니다.',
        steps: [
          '승모근 위에 바벨을 안정적으로 견착합니다.',
          '발을 어깨너비로 벌리고 발끝은 바깥쪽으로 살짝 향하게 합니다.',
          '엉덩이를 뒤로 빼며 무릎이 발끝 방향으로 향하도록 앉습니다.',
          '발바닥 전체로 지면을 밀어내며 일어섭니다.'
        ],
        tips: '무릎이 안쪽으로 모이지 않도록 주의하세요.'
      }
    ]
  };

  const muscleCategories = ['전체', '가슴', '등', '어깨', '하체', '팔', '복근/코어', '전신/유산소'];
  const difficultyLevels = [
    { label: '초급 (입문자)' },
    { label: '중급 (경험자)' },
    { label: '상급 (숙련자)' },
  ];

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
            onClick={() => setActiveTab('dictionary')}
            className={`flex items-center gap-3 px-4 py-3 rounded-full text-left font-medium transition-all ${
              activeTab === 'dictionary' 
                ? 'bg-[#1F3F7A] text-white shadow-[0_0_20px_rgba(31,63,122,0.3)] font-bold' 
                : 'text-[#c4c6cf] hover:bg-[#31394d]/20'
            }`}
          >
            <span className="material-symbols-outlined">menu_book</span>
            <span>운동 도사전</span>
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
          <h1 className="text-xl font-bold text-white">
            {activeTab === 'recommend' && '맞춤 운동 추천'}
            {activeTab === 'dictionary' && '운동 도사전 (운동 목록 및 자세 가이드)'}
            {activeTab === 'routine' && '요일별 운동 루틴'}
          </h1>
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

          {/* 운동 도사전 탭 화면 */}
          {activeTab === 'dictionary' && (
            <div className="space-y-6 pb-20">
              <section className="bg-[#31394d]/20 backdrop-blur-xl border border-white/5 p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-[#9BCB3C]">fitness_center</span>
                  <h2 className="text-lg font-bold text-white">부위별 운동 도사전</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(exerciseDictionary).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedDictCategory(cat);
                        setSelectedExercise(null);
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                        selectedDictCategory === cat
                          ? 'bg-[#9BCB3C] text-[#0d1a00] shadow-[0_0_20px_rgba(155,203,60,0.3)]'
                          : 'bg-[#242d47] border border-[#44474e] text-[#c4c6cf] hover:border-[#9BCB3C]/50'
                      }`}
                    >
                      {cat} 부위
                    </button>
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#31394d]/20 backdrop-blur-xl border border-white/5 p-6 rounded-3xl space-y-4">
                  <h3 className="text-base font-bold text-white">📋 {selectedDictCategory} 운동 목록</h3>
                  <div className="space-y-3">
                    {exerciseDictionary[selectedDictCategory]?.map((ex, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedExercise(ex)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedExercise?.name === ex.name
                            ? 'bg-[#1F3F7A]/40 border-[#1F3F7A]'
                            : 'bg-[#242d47]/50 border-[#44474e] hover:border-[#9BCB3C]/50'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-bold text-white text-sm">{ex.name}</h4>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#9BCB3C]/10 text-[#9BCB3C] border border-[#9BCB3C]/20">{ex.difficulty}</span>
                        </div>
                        <p className="text-xs text-[#c4c6cf] opacity-80">타겟: {ex.target}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#31394d]/20 backdrop-blur-xl border border-white/5 p-6 rounded-3xl space-y-4">
                  <h3 className="text-base font-bold text-white">🔍 올바른 자세 및 가이드</h3>
                  {selectedExercise ? (
                    <div className="space-y-4 text-sm">
                      <div>
                        <span className="text-xs text-[#9BCB3C] font-bold uppercase tracking-wider">운동명</span>
                        <h4 className="text-lg font-bold text-white mt-0.5">{selectedExercise.name}</h4>
                        <p className="text-[#c4c6cf] text-xs mt-1 leading-relaxed">{selectedExercise.description}</p>
                      </div>

                      <div>
                        <span className="text-xs text-[#9BCB3C] font-bold uppercase tracking-wider">주요 타겟 근육</span>
                        <p className="text-white text-xs mt-0.5">{selectedExercise.target}</p>
                      </div>

                      <div>
                        <span className="text-xs text-[#9BCB3C] font-bold uppercase tracking-wider">수행 단계 (스텝)</span>
                        <ol className="list-decimal list-inside space-y-1.5 mt-1 text-[#c4c6cf] text-xs leading-relaxed">
                          {selectedExercise.steps.map((step, sIdx) => (
                            <li key={sIdx}>{step}</li>
                          ))}
                        </ol>
                      </div>

                      <div className="p-3 rounded-xl bg-[#9BCB3C]/5 border border-[#9BCB3C]/20">
                        <span className="text-xs text-[#9BCB3C] font-bold block mb-1">💡 트레이너 꿀팁 & 주의사항</span>
                        <p className="text-[#e2e2e6] text-xs">{selectedExercise.tips}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center text-[#c4c6cf] opacity-60 space-y-2">
                      <span className="material-symbols-outlined text-4xl">touch_app</span>
                      <p className="text-sm">왼쪽 목록에서 운동을 선택하시면<br />상세한 자세 가이드가 표시됩니다.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
