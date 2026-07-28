import React, { useState, useRef, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  arrayUnion, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';

const DAYS = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
const DIFFICULTY_LEVELS = ['초급 (입문자)', '중급 (경험자)', '상급 (숙련자)'];
const MUSCLE_CATEGORIES = ['전체', '가슴', '등', '어깨', '하체', '팔', '복근/코어', '전신/유산소'];
const BOARD_CATEGORIES = ['전체', '질문', '루틴공유', '자유', '피드백/의견'];

const EQUIPMENT_LIST = [
  { id: 1, category: '가슴', name: '체스트 프레스 머신 (Chest Press Machine)', muscle: '대흉근(중부 가슴), 삼두근', desc: '가슴 전반적인 두께와 근력을 안전하게 키워주는 머신입니다.', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80' },
  { id: 2, category: '가슴', name: '인클라인 체스트 프레스', muscle: '대흉근 상부(윗가슴)', desc: '윗가슴 볼륨감을 채워주는 가슴 상부 전용 기구입니다.', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80' },
  { id: 3, category: '가슴', name: '펙덱 플라이 (Pec Deck Fly)', muscle: '대흉근 안쪽(가슴 모으기)', desc: '가슴 중앙 선을 선명하게 다듬고 안쪽 자극을 극대화합니다.', image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=600&q=80' },
  { id: 4, category: '등', name: '랫 풀 다운 (Lat Pull Down)', muscle: '광배근(등 외곽)', desc: '등 폭을 넓혀 V자 라인을 만드는 대표적인 등 기구입니다.', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80' },
  { id: 5, category: '등', name: '시티드 케이블 로우 (Seated Cable Row)', muscle: '승모근, 능형근, 광배근 중부', desc: '등 안쪽의 두께감을 살려주고 굽은 체형을 바르게 잡아줍니다.', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=600&q=80' },
  { id: 6, category: '어깨', name: '숄더 프레스 머신 (Shoulder Press)', muscle: '전면/측면 삼각근', desc: '어깨 전반의 볼륨을 안전하게 키워주는 대표 어깨 기구입니다.', image: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=600&q=80' },
  { id: 7, category: '어깨', name: '리어 델트 머신 (Rear Delt Fly)', muscle: '후면 삼각근', desc: '어깨 뒤쪽의 둥근 라인을 만들고 입체감을 더해줍니다.', image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80' },
  { id: 8, category: '하체', name: '레그 프레스 (Leg Press Machine)', muscle: '대퇴사두근(허벅지 앞), 둔근', desc: '허리 부담 없이 하체 전체에 높은 중량을 전달할 수 있습니다.', image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80' },
  { id: 9, category: '하체', name: '레그 익스텐션 (Leg Extension)', muscle: '대퇴사두근(허벅지 전면)', desc: '허벅지 앞쪽 근육 갈라짐을 선명하게 다듬어 줍니다.', image: 'https://images.unsplash.com/photo-1434596922112-19c563067271?auto=format&fit=crop&w=600&q=80' },
  { id: 10, category: '하체', name: '라잉 레그 컬 (Lying Leg Curl)', muscle: '햄스트링(허벅지 후면)', desc: '허벅지 뒤쪽 라인을 다듬고 무릎 관절 안전성을 높입니다.', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80' },
  { id: 11, category: '팔', name: '케이블 푸시다운 (Cable Pushdown)', muscle: '상완삼두근(팔 뒷근육)', desc: '팔 뒤쪽 삼두근 선명도를 높이고 매끄러운 팔 라인을 만듭니다.', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80' },
  { id: 12, category: '팔', name: '암 컬 머신 (Preacher Curl Machine)', muscle: '상완이두근(팔 앞근육)', desc: '팔 앞쪽 봉오리를 높여주는 선별적 이두근 강화 기구입니다.', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80' },
  { id: 13, category: '복근/코어', name: '디클라인 크런치 벤치', muscle: '복직근(상부 복근)', desc: '경사를 활용하여 강한 복근 자극을 전하는 전문 벤치입니다.', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80' },
  { id: 14, category: '전신/유산소', name: '천국의 계단 (Stair Master)', muscle: '하체 전체, 심폐지구력', desc: '유산소와 하체 애플힙 운동을 동시에 돕는 고강도 카드오 기구입니다.', image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=600&q=80' },
  { id: 15, category: '전신/유산소', name: '로잉 머신 (Rowing Machine)', muscle: '전신(등, 하체, 코어), 심폐지구력', desc: '상/하체 전신 근육과 칼로리 소모를 최대화하는 유산소 기구입니다.', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80' }
];

const POSE_LIST = [
  { id: 1, category: '가슴', name: '덤벨 벤치프레스', muscle: '대흉근 전체, 삼두근', pose: '벤치에 누워 덤벨을 가슴 중앙 수직 방향으로 밀어 올렸다 내립니다.', tip: '바벨보다 가동 범위가 넓어 가슴 외곽과 중앙 자극에 유리합니다.', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80' },
  { id: 2, category: '가슴', name: '딥스 (Dips)', muscle: '대흉근 하부, 삼두근', pose: '평행봉을 잡고 상체를 약간 앞으로 숙인 채 팔꿈치를 굽혀 내려갑니다.', tip: '상체를 앞으로 숙일수록 아랫가슴 자극이 커집니다.', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80' },
  { id: 3, category: '등', name: '바벨 벤트오버 로우', muscle: '광배근, 승모근, 코어', pose: '상체를 45도 숙이고 바벨을 배꼽 방향으로 당겨 올립니다.', tip: '허리가 말리지 않도록 아랫배에 힘을 주고 유지합니다.', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=600&q=80' },
  { id: 4, category: '등', name: '컨벤셔널 데드리프트', muscle: '척추기립근, 둔근, 햄스트링, 광배근', pose: '바벨을 몸에 밀착시킨 뒤 하체와 등 힘으로 고관절을 펼쳐 올립니다.', tip: '바벨이 몸에서 멀어지면 허리에 부상이 올 수 있으니 붙여서 진행합니다.', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80' },
  { id: 5, category: '어깨', name: '사이드 레터럴 레이즈', muscle: '측면 삼각근', pose: '덤벨을 양손에 들고 팔꿈치를 살짝 구부린 상태에서 옆으로 들어 올립니다.', tip: '어깨가 위로 솟지 않도록 승모근을 내리고 어깨로만 들어 올립니다.', image: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=600&q=80' },
  { id: 6, category: '어깨', name: '페이스 풀 (Face Pull)', muscle: '후면 삼각근, 상부 승모근', pose: '케이블 로프를 얼굴 인중 방향으로 당겨 팔꿈치를 뒤로 뺍니다.', tip: '라운드 숄더 개선 및 어깨 후면 자극에 최고의 운동입니다.', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80' },
  { id: 7, category: '하체', name: '바벨 백 스쿼트', muscle: '대퇴사두근, 대둔근, 코어', pose: '승모근 위에 바벨을 얹고 고관절과 무릎을 접어 앉았다 일어납니다.', tip: '무릎과 발끝의 방향을 항상 일치시켜 진행합니다.', image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80' },
  { id: 8, category: '하체', name: '루마니안 데드리프트', muscle: '햄스트링, 둔근, 척추기립근', pose: '무릎을 살짝 구부린 고정 상태에서 골반을 뒤로 빼며 바벨을 내립니다.', tip: '허벅지 뒤쪽이 팽팽하게 늘어나는 자극에 집중합니다.', image: 'https://images.unsplash.com/photo-1434596922112-19c563067271?auto=format&fit=crop&w=600&q=80' },
  { id: 9, category: '하체', name: '힙 쓰러스트 (Hip Thrust)', muscle: '대둔근(엉덩이 전문)', pose: '등을 벤치에 대고 골반 위에 바벨을 올린 뒤 엉덩 힘으로 위로 들어 올립니다.', tip: '애플힙 및 엉덩이 볼륨에 가장 효율적인 운동입니다.', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80' },
  { id: 10, category: '팔', name: '라이닝 트라이셉스 익스텐션', muscle: '상완삼두근 장두', pose: '벤치에 누워 EZ바를 이마 뒤쪽으로 천천히 내렸다 팔꿈치를 폅니다.', tip: '팔꿈치가 양옆으로 벌어지지 않도록 고정합니다.', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80' },
  { id: 11, category: '팔', name: '해머 컬 (Hammer Curl)', muscle: '상완근, 상완이두근, 전완근', pose: '덤벨을 망치 쥐듯 세로로 잡고 위로 구부려 올립니다.', tip: '팔 두께감을 키우고 악력 및 전완근 강화에 도움을 줍니다.', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80' },
  { id: 12, category: '복근/코어', name: '레그 레이즈 (Leg Raise)', muscle: '하복부 (아랫배)', pose: '바닥에 누워 허리가 뜨지 않게 누른 상태에서 다리를 올려줍니다.', tip: '허리가 바닥에서 떨어지면 다리를 내리는 범위를 줄입니다.', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80' },
  { id: 13, category: '전신/유산소', name: '버피 테스트 (Burpee Test)', muscle: '전신 근육, 심폐지구력', pose: '엎드렸다가 엎드려뻗쳐 후 풋샵 동작 후 일어나며 점프합니다.', tip: '짧은 시간 동안 최고 효과를 내는 대표 칼로리 소모 운동입니다.', image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=600&q=80' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('recommend'); 
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState('전체');
  const [selectedDifficulty, setSelectedDifficulty] = useState('초급 (입문자)');

  const [userInfo, setUserInfo] = useState({ weight: '', height: '', age: '' });
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [muscleImageUrl, setMuscleImageUrl] = useState('');
  const [targetMusclesName, setTargetMusclesName] = useState('');

  const [routines, setRoutines] = useState(() => {
    const saved = localStorage.getItem('weekly_routines');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { 월요일: '', 화요일: '', 수요일: '', 목요일: '', 금요일: '', 토요일: '', 일요일: '' };
  });

  const [selectedDay, setSelectedDay] = useState('월요일');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const [posts, setPosts] = useState([]);
  const [selectedBoardCategory, setSelectedBoardCategory] = useState('전체');
  const [newPost, setNewPost] = useState({ category: '질문', title: '', author: '', content: '' });
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [postLoading, setPostLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(fetchedPosts);
    }, (error) => {
      console.error("Firestore 수신 오류:", error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('weekly_routines', JSON.stringify(routines));
  }, [routines]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoutineChange = (day, text) => {
    setRoutines(prev => ({ ...prev, [day]: text }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveToRoutine = (day) => {
    if (!result) return;
    const contentToSave = result + (targetMusclesName ? `
[타겟 근육: ${targetMusclesName}]` : '');
    setRoutines(prev => ({ ...prev, [day]: contentToSave }));
    setSaveSuccessMsg(`'${day}' 루틴에 저장되었습니다!`);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.author || !newPost.content) {
      alert('모든 항목을 입력해 주세요.');
      return;
    }

    setPostLoading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        category: newPost.category,
        title: newPost.title,
        author: newPost.author,
        content: newPost.content,
        createdAt: serverTimestamp(),
        comments: []
      });
      setNewPost({ category: '질문', title: '', author: '', content: '' });
      alert(newPost.category === '피드백/의견' ? '의견이 소중히 접수되었습니다. 감사합니다!' : '게시글이 성공적으로 등록되었습니다!');
    } catch (err) {
      console.error("게시글 작성 오류:", err);
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setPostLoading(false);
    }
  };

  const handleAddComment = async (postId) => {
    if (!newComment.trim()) return;

    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: arrayUnion({
          text: newComment,
          createdAt: new Date().toLocaleDateString()
        })
      });
      setNewComment('');
    } catch (err) {
      console.error("댓글 작성 오류:", err);
      alert('댓글 작성 실패');
    }
  };

  const handleSubmit = async (mode) => {
    setLoading(true);
    setResult('');
    setMuscleImageUrl('');
    setTargetMusclesName('');
    setSaveSuccessMsg('');

    let payload = {};
    if (mode === 'recommend') {
      if (!userInfo.weight || !userInfo.height || !userInfo.age) {
        alert('모든 신체 정보를 입력해 주세요.');
        setLoading(false);
        return;
      }
      payload = { ...userInfo, targetCategory: selectedMuscleFilter, difficulty: selectedDifficulty };
    } else if (mode === 'vision') {
      if (!selectedImage) {
        alert('운동기구 사진을 촬영하거나 업로드해 주세요.');
        setLoading(false);
        return;
      }
      payload = { imageBase64: selectedImage };
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, payload }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data.text);
        if (data.imageUrl) setMuscleImageUrl(data.imageUrl);
        if (data.targetMusclesEn) setTargetMusclesName(data.targetMusclesEn);
      } else {
        setResult(`오류 발생: ${data.error}`);
      }
    } catch (err) {
      setResult('요청을 처리하는 중 통신 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'recommend', icon: '🏋️', label: '맞춤 운동 추천' },
    { id: 'routine', icon: '📅', label: '요일별 루틴' },
    { id: 'vision', icon: '📷', label: '운동기구 인식' },
    { id: 'equipments', icon: '🛠️', label: '운동기구 목록' },
    { id: 'poses', icon: '🧘', label: '운동자세 목록' },
    { id: 'board', icon: '💬', label: '커뮤니티 게시판' },
  ];

  const filteredEquipments = selectedMuscleFilter === '전체' 
    ? EQUIPMENT_LIST 
    : EQUIPMENT_LIST.filter(e => e.category === selectedMuscleFilter);

  const filteredPoses = selectedMuscleFilter === '전체' 
    ? POSE_LIST 
    : POSE_LIST.filter(p => p.category === selectedMuscleFilter);

  const filteredPosts = selectedBoardCategory === '전체'
    ? posts
    : posts.filter(p => p.category === selectedBoardCategory);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f4f6f8' }}>
      <aside style={{ width: '240px', backgroundColor: '#1e293b', color: '#fff', padding: '24px 16px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', boxShadow: '2px 0 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '30px', textAlign: 'center', color: '#60a5fa' }}>💪 AI 피트니스</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setResult(''); setMuscleImageUrl(''); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none',
                  backgroundColor: isActive ? '#2563eb' : 'transparent', color: isActive ? '#ffffff' : '#94a3b8',
                  fontWeight: isActive ? 'bold' : 'normal', fontSize: '0.95rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '32px', maxWidth: '850px', boxSizing: 'border-box' }}>
        <header style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '1.6rem', color: '#0f172a', margin: '0 0 16px 0' }}>
            {menuItems.find(m => m.id === activeTab)?.icon} {menuItems.find(m => m.id === activeTab)?.label}
          </h1>

          {activeTab !== 'routine' && activeTab !== 'vision' && activeTab !== 'board' && (
            <div style={{ backgroundColor: '#fff', padding: '12px 16px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#475569' }}>🎯 타겟 부위:</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {MUSCLE_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedMuscleFilter(cat)}
                    style={{
                      padding: '6px 12px', borderRadius: '16px', border: selectedMuscleFilter === cat ? 'none' : '1px solid #cbd5e1',
                      backgroundColor: selectedMuscleFilter === cat ? '#2563eb' : '#f8fafc', color: selectedMuscleFilter === cat ? '#fff' : '#475569',
                      fontWeight: selectedMuscleFilter === cat ? 'bold' : 'normal', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {activeTab === 'recommend' && (
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#334155' }}>⚡ 운동 난이도 선택</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {DIFFICULTY_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedDifficulty(level)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '8px', border: selectedDifficulty === level ? 'none' : '1px solid #cbd5e1',
                      backgroundColor: selectedDifficulty === level ? '#8b5cf6' : '#f8fafc', color: selectedDifficulty === level ? '#ffffff' : '#475569',
                      fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s'
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: '10px 14px', backgroundColor: '#eff6ff', borderRadius: '6px', color: '#1e40af', fontSize: '0.88rem', lineHeight: '1.4' }}>
              🎯 선택 부위: <strong>{selectedMuscleFilter}</strong> | ⚡ 선택 난이도: <strong>{selectedDifficulty}</strong>
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px', color: '#334155' }}>체중 (kg)</label>
              <input type="number" name="weight" value={userInfo.weight} onChange={handleInputChange} placeholder="예: 70" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px', color: '#334155' }}>키 (cm)</label>
              <input type="number" name="height" value={userInfo.height} onChange={handleInputChange} placeholder="예: 175" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px', color: '#334155' }}>연령 (세)</label>
              <input type="number" name="age" value={userInfo.age} onChange={handleInputChange} placeholder="예: 25" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>
            <button onClick={() => handleSubmit('recommend')} disabled={loading} style={{ padding: '14px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', fontSize: '1rem' }}>
              {loading ? 'AI 분석 및 근육 지도 생성 중...' : `'${selectedDifficulty}' 맞춤 운동 추천받기`}
            </button>
          </div>
        )}

        {activeTab === 'routine' && (
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    padding: '8px 14px', borderRadius: '20px', border: '1px solid #2563eb',
                    backgroundColor: selectedDay === day ? '#2563eb' : '#fff', color: selectedDay === day ? '#fff' : '#2563eb',
                    fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap'
                  }}
                >
                  {day}
                </button>
              ))}
            </div>

            <div>
              <h3 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>📌 {selectedDay} 운동 루틴</h3>
              <textarea
                rows="10"
                value={routines[selectedDay]}
                onChange={(e) => handleRoutineChange(selectedDay, e.target.value)}
                placeholder={`${selectedDay}에 수행할 운동 루틴을 작성하세요.`}
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'sans-serif', lineHeight: '1.5', resize: 'vertical' }}
              />
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px' }}>
                💡 입력 또는 변경된 내용은 브라우저에 자동 저장됩니다.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'vision' && (
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current.click()} style={{ width: '100%', padding: '14px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
              📷 사진 촬영 또는 이미지 업로드
            </button>

            {selectedImage && (
              <div style={{ textAlign: 'center', width: '100%' }}>
                <img src={selectedImage} alt="선택한 운동기구" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
            )}

            <button onClick={() => handleSubmit('vision')} disabled={loading || !selectedImage} style={{ width: '100%', padding: '14px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
              {loading ? '기구 분석 및 근육 지도 생성 중...' : '운동기구 분석하기'}
            </button>
          </div>
        )}

        {activeTab === 'equipments' && (
          <div>
            {filteredEquipments.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>해당 부위에 해당하는 운동기구가 없습니다.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                {filteredEquipments.map((item) => (
                  <div key={item.id} style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', borderTop: '4px solid #0284c7', display: 'flex', flexDirection: 'column' }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>{item.name}</h3>
                          <span style={{ fontSize: '0.75rem', backgroundColor: '#e0f2fe', color: '#0284c7', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{item.category}</span>
                        </div>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#dc2626', fontWeight: 'bold' }}>🎯 자극 부위: {item.muscle}</p>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: '1.4' }}>{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'poses' && (
          <div>
            {filteredPoses.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>해당 부위에 해당하는 운동 자세가 없습니다.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredPoses.map((item) => (
                  <div key={item.id} style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', borderLeft: '5px solid #16a34a', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                    <img src={item.image} alt={item.name} style={{ width: '200px', height: '150px', objectFit: 'cover' }} />
                    <div style={{ padding: '16px', flex: 1, minWidth: '240px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{item.name}</h3>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{item.category}</span>
                          <span style={{ fontSize: '0.85rem', color: '#16a34a', backgroundColor: '#f0fdf4', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>🎯 자극: {item.muscle}</span>
                        </div>
                      </div>
                      <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#334155', lineHeight: '1.5' }}><strong>자세 설명:</strong> {item.pose}</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>💡 <strong>팁:</strong> {item.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'board' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>✏️ 게시글 작성 / 의견 전달하기</h3>
              <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="질문">질문</option>
                    <option value="루틴공유">루틴공유</option>
                    <option value="자유">자유</option>
                    <option value="피드백/의견">💡 피드백/의견</option>
                  </select>
                  <input
                    type="text"
                    placeholder="작성자 닉네임"
                    value={newPost.author}
                    onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '140px' }}
                  />
                  <input
                    type="text"
                    placeholder={newPost.category === '피드백/의견' ? '어떤 기능이나 개선점을 제안하시나요?' : '글 제목'}
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: 1 }}
                  />
                </div>
                <textarea
                  placeholder={newPost.category === '피드백/의견' ? '앱 사용 후기나 개선할 의견을 자율적으로 남겨주세요!' : '내용을 입력하세요...'}
                  rows="4"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                />
                <button 
                  type="submit" 
                  disabled={postLoading}
                  style={{ 
                    padding: '12px', 
                    backgroundColor: newPost.category === '피드백/의견' ? '#ea580c' : '#2563eb', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '6px', 
                    fontWeight: 'bold', 
                    cursor: 'pointer' 
                  }}
                >
                  {postLoading ? '등록 중...' : (newPost.category === '피드백/의견' ? '💡 사용자 의견 전달하기' : '게시글 등록하기')}
                </button>
              </form>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {BOARD_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedBoardCategory(cat)}
                  style={{
                    padding: '8px 16px', borderRadius: '20px', border: 'none',
                    backgroundColor: selectedBoardCategory === cat ? (cat === '피드백/의견' ? '#ea580c' : '#0f172a') : '#e2e8f0',
                    color: selectedBoardCategory === cat ? '#fff' : '#475569', fontWeight: 'bold', cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredPosts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', backgroundColor: '#fff', borderRadius: '12px' }}>
                  등록된 게시글이나 의견이 없습니다. 첫 글을 작성해 보세요!
                </div>
              ) : (
                filteredPosts.map(post => (
                  <div key={post.id} style={{ backgroundColor: '#fff', padding: '16px 20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: post.category === '피드백/의견' ? '4px solid #ea580c' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ 
                        backgroundColor: post.category === '피드백/의견' ? '#ffedd5' : '#eff6ff', 
                        color: post.category === '피드백/의견' ? '#c2410c' : '#2563eb', 
                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' 
                      }}>
                        {post.category}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{post.author}</span>
                    </div>
                    <h4
                      onClick={() => setSelectedPostId(selectedPostId === post.id ? null : post.id)}
                      style={{ margin: '0 0 8px 0', color: '#0f172a', cursor: 'pointer', fontSize: '1.05rem' }}
                    >
                      {post.title}
                    </h4>
                    
                    {selectedPostId === post.id && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                        <p style={{ margin: '0 0 16px 0', color: '#334155', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{post.content}</p>
                        
                        <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#475569', display: 'block', marginBottom: '8px' }}>💬 댓글 ({post.comments ? post.comments.length : 0})</strong>
                          {post.comments && post.comments.map((c, i) => (
                            <p key={i} style={{ margin: '4px 0', fontSize: '0.88rem', color: '#334155' }}>
                              • {typeof c === 'object' ? c.text : c}
                            </p>
                          ))}
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="댓글이나 피드백 답변을 입력하세요..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                          />
                          <button onClick={() => handleAddComment(post.id)} style={{ padding: '8px 14px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            댓글 작성
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {result && (activeTab === 'recommend' || activeTab === 'vision') && (
          <div style={{ marginTop: '24px', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '5px solid #2563eb' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#2563eb' }}>분석 및 추천 결과</h3>

            {muscleImageUrl && (
              <div style={{ textAlign: 'center', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#dc2626', display: 'block', marginBottom: '10px' }}>
                  🩸 주요 자극 근육 부위 시각화
                </span>
                <img src={muscleImageUrl} alt="자극 근육 부위 해부도" style={{ maxWidth: '100%', maxHeight: '320px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                {targetMusclesName && (
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px', margin: 0 }}>
                    타겟 근육: {targetMusclesName}
                  </p>
                )}
              </div>
            )}

            <p style={{ margin: 0, marginBottom: '20px', whiteSpace: 'pre-line', lineHeight: '1.6', color: '#334155' }}>{result}</p>

            <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '20px 0' }} />

            <div>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'block', marginBottom: '10px', color: '#1e293b' }}>
                💾 특정 요일 루틴에 저장:
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {DAYS.map(day => (
                  <button
                    key={day}
                    onClick={() => handleSaveToRoutine(day)}
                    style={{
                      padding: '6px 12px', borderRadius: '4px', border: '1px solid #16a34a',
                      backgroundColor: '#f0fdf4', color: '#16a34a', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer'
                    }}
                  >
                    {day}에 저장
                  </button>
                ))}
              </div>
              {saveSuccessMsg && (
                <div style={{ marginTop: '10px', color: '#16a34a', fontWeight: 'bold', fontSize: '0.85rem' }}>
                  {saveSuccessMsg}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
