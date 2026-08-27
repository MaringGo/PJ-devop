import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  User, Shield, KeyRound, Save, CheckCircle2, AlertCircle,
  Clock, CreditCard, Building, Mail, Phone, FileText,
  Eye, EyeOff, Sparkles, RefreshCw, Calendar, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AVATAR_COLORS = [
  '#4f46e5', // Indigo
  '#2563eb', // Blue
  '#06b6d4', // Cyan
  '#0d9488', // Teal
  '#10b981', // Emerald
  '#84cc16', // Lime
  '#f59e0b', // Amber
  '#ea580c', // Orange
  '#e11d48', // Rose
  '#9333ea', // Purple
  '#db2777', // Pink
  '#475569', // Slate
];

const Profile = () => {
  const { user: authUser, updateUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'security' | 'activity'
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({ tx_count: 0, tx_total: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Form states - Profile Info
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    avatar_color: '#4f46e5',
    bio: ''
  });
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMsg, setInfoMsg] = useState({ type: '', text: '' });

  // Form states - Password
  const [pwData, setPwData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/auth/profile', { headers });
      const u = res.data.user;
      setProfileData(u);
      setStats(res.data.stats || { tx_count: 0, tx_total: 0 });
      setRecentTransactions(res.data.recent_transactions || []);
      setFormData({
        full_name: u.full_name || '',
        email: u.email || '',
        phone: u.phone || '',
        department: u.department || 'สำนักงาน',
        avatar_color: u.avatar_color || '#4f46e5',
        bio: u.bio || ''
      });
      // Sync auth context with latest data
      updateUser(u);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMsg({ type: '', text: '' });
    try {
      const res = await axios.put('http://localhost:5000/api/auth/profile', formData, { headers });
      setInfoMsg({ type: 'success', text: res.data.message || 'บันทึกข้อมูลส่วนตัวสำเร็จแล้ว' });
      setProfileData(res.data.user);
      updateUser(res.data.user);
    } catch (err) {
      setInfoMsg({
        type: 'error',
        text: err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
      });
    } finally {
      setSavingInfo(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });

    if (pwData.new_password !== pwData.confirm_password) {
      setPwMsg({ type: 'error', text: 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน' });
      return;
    }

    if (pwData.new_password.length < 6) {
      setPwMsg({ type: 'error', text: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
      return;
    }

    setSavingPw(true);
    try {
      const res = await axios.put('http://localhost:5000/api/auth/change-password', {
        current_password: pwData.current_password,
        new_password: pwData.new_password
      }, { headers });

      setPwMsg({ type: 'success', text: res.data.message || 'เปลี่ยนรหัสผ่านสำเร็จเรียบร้อย' });
      setPwData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPwMsg({
        type: 'error',
        text: err.response?.data?.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาตรวจสอบรหัสผ่านเดิม'
      });
    } finally {
      setSavingPw(false);
    }
  };

  const getInitials = (name, username) => {
    if (name && name.trim().length > 0) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    return (username || 'U').substring(0, 2).toUpperCase();
  };

  if (loading && !profileData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-indigo-600">
          <RefreshCw className="animate-spin" size={24} />
          <span className="font-medium text-gray-700">กำลังโหลดข้อมูลโปรไฟล์...</span>
        </div>
      </div>
    );
  }

  const currentUser = profileData || authUser || {};
  const currentAvatarColor = formData.avatar_color || currentUser.avatar_color || '#4f46e5';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── User Hero Banner Card ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white shadow-lg">
        {/* Subtle decorative background shapes */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 rounded-full bg-purple-500/20 blur-xl pointer-events-none" />

        <div className="relative p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with selected background color */}
          <div className="relative group">
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-md border-4 border-white/30 text-white transition-transform transform group-hover:scale-105"
              style={{ backgroundColor: currentAvatarColor }}
            >
              {getInitials(formData.full_name || currentUser.full_name, currentUser.username)}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="สถานะ: ออนไลน์">
              <Sparkles size={14} />
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {formData.full_name || currentUser.full_name || currentUser.username}
              </h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/30 text-white">
                {currentUser.role || 'ผู้ใช้งานทั่วไป'}
              </span>
            </div>

            <p className="text-indigo-200 text-sm font-mono">@{currentUser.username}</p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs sm:text-sm text-indigo-100">
              <div className="flex items-center gap-1.5 bg-black/10 px-2.5 py-1 rounded-md">
                <Building size={15} className="text-indigo-300" />
                <span>{formData.department || currentUser.department || 'สำนักงาน'}</span>
              </div>
              {currentUser.email && (
                <div className="flex items-center gap-1.5 bg-black/10 px-2.5 py-1 rounded-md">
                  <Mail size={15} className="text-indigo-300" />
                  <span>{currentUser.email}</span>
                </div>
              )}
              {currentUser.created_at && (
                <div className="flex items-center gap-1.5 bg-black/10 px-2.5 py-1 rounded-md">
                  <Calendar size={15} className="text-indigo-300" />
                  <span>
                    สมาชิกตั้งแต่ {new Date(currentUser.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Refresh Action */}
          <div className="self-center md:self-start">
            <button
              onClick={fetchProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/15 hover:bg-white/25 rounded-lg border border-white/20 transition-colors"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>รีเฟรช</span>
            </button>
          </div>
        </div>

        {/* Mini stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-white/15 bg-black/10 divide-x divide-white/10 text-center">
          <div className="p-3 sm:p-4">
            <p className="text-xs text-indigo-200">รายการที่บันทึก</p>
            <p className="text-lg sm:text-xl font-bold mt-0.5">{stats.tx_count.toLocaleString()} รายการ</p>
          </div>
          <div className="p-3 sm:p-4">
            <p className="text-xs text-indigo-200">ยอดเงินรวมที่บันทึก</p>
            <p className="text-lg sm:text-xl font-bold mt-0.5">฿{stats.tx_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="p-3 sm:p-4">
            <p className="text-xs text-indigo-200">สิทธิ์ผู้ใช้งาน</p>
            <p className="text-lg sm:text-xl font-bold mt-0.5">{currentUser.role || 'มาตรฐาน'}</p>
          </div>
          <div className="p-3 sm:p-4">
            <p className="text-xs text-indigo-200">สถานะบัญชี</p>
            <p className="text-lg sm:text-xl font-bold mt-0.5 text-emerald-300">เปิดใช้งานปกติ</p>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex border-b border-gray-200 bg-white rounded-xl p-1.5 shadow-sm">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'info'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <User size={18} />
          <span>ข้อมูลส่วนตัว</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Shield size={18} />
          <span>ความปลอดภัย & รหัสผ่าน</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'activity'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Clock size={18} />
          <span>ประวัติรายการที่บันทึก ({stats.tx_count})</span>
        </button>
      </div>

      {/* ── Tab 1: Personal Info Tab ── */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">แก้ไขข้อมูลส่วนตัว</h2>
              <p className="text-sm text-gray-500 mt-0.5">จัดการข้อมูลโปรไฟล์และรายละเอียดการติดต่อของคุณ</p>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <User size={22} />
            </div>
          </div>

          {infoMsg.text && (
            <div
              className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                infoMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {infoMsg.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="font-medium">{infoMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleInfoSubmit} className="space-y-6">
            {/* Avatar Color Picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                เลือกสีประจำตัว (Avatar Theme Color)
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {AVATAR_COLORS.map((c) => {
                  const isSelected = formData.avatar_color === c;
                  return (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setFormData({ ...formData, avatar_color: c })}
                      className={`w-8 h-8 rounded-full transition-transform flex items-center justify-center ${
                        isSelected ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500 shadow-md' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    >
                      {isSelected && <CheckCircle2 size={16} className="text-white drop-shadow" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username (Read Only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้ (Username)</label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={currentUser.username || ''}
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-xl text-gray-600 cursor-not-allowed text-sm font-mono"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">ไม่สามารถเปลี่ยนได้</span>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อ - นามสกุล <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="เช่น สมชาย ใจดี"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                  />
                  <User size={18} className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมลติดต่อ</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                  />
                  <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="08X-XXX-XXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                  />
                  <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">แผนก / ฝ่ายงาน</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="เช่น ฝ่ายการเงิน, ฝ่ายบริหารและไอที"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                  />
                  <Building size={18} className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              {/* Role (Read only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">บทบาทในระบบ</label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={currentUser.role || 'ผู้ใช้งานทั่วไป'}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-300 rounded-xl text-gray-600 cursor-not-allowed text-sm"
                  />
                  <Shield size={18} className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Bio / Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">บันทึกช่วยจำ / ข้อความแนะนำตัว</label>
              <div className="relative">
                <textarea
                  rows={3}
                  placeholder="เขียนข้อความสั้นๆ เกี่ยวกับหน้าที่รับผิดชอบหรือบันทึกของคุณ..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all resize-none"
                />
                <FileText size={18} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingInfo}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm shadow-md shadow-indigo-200 transition-all disabled:opacity-50 cursor-pointer"
              >
                {savingInfo ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>บันทึกการเปลี่ยนแปลง</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tab 2: Security & Password Tab ── */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">เปลี่ยนรหัสผ่าน</h2>
              <p className="text-sm text-gray-500 mt-0.5">เพื่อความปลอดภัย กรุณาตั้งรหัสผ่านที่มีความยาวอย่างน้อย 6 ตัวอักษร</p>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <KeyRound size={22} />
            </div>
          </div>

          {pwMsg.text && (
            <div
              className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                pwMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {pwMsg.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="font-medium">{pwMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-xl">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสผ่านปัจจุบัน <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  required
                  placeholder="กรอกรหัสผ่านเดิม"
                  value={pwData.current_password}
                  onChange={(e) => setPwData({ ...pwData, current_password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                />
                <KeyRound size={18} className="absolute left-3 top-3 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสผ่านใหม่ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  required
                  placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                  value={pwData.new_password}
                  onChange={(e) => setPwData({ ...pwData, new_password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                />
                <KeyRound size={18} className="absolute left-3 top-3 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  required
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  value={pwData.confirm_password}
                  onChange={(e) => setPwData({ ...pwData, confirm_password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
                />
                <KeyRound size={18} className="absolute left-3 top-3 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Password Validation checklist */}
            <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-200/60 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    pwData.new_password.length >= 6 ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                />
                <span>ความยาวอย่างน้อย 6 ตัวอักษร</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    pwData.new_password && pwData.new_password === pwData.confirm_password
                      ? 'bg-emerald-500'
                      : 'bg-gray-300'
                  }`}
                />
                <span>รหัสผ่านใหม่ตรงกับช่องยืนยันรหัสผ่าน</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPw}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm shadow-md shadow-indigo-200 transition-all disabled:opacity-50 cursor-pointer"
              >
                {savingPw ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>กำลังอัปเดต...</span>
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    <span>ยืนยันการเปลี่ยนรหัสผ่าน</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tab 3: Activity & Transactions Log Tab ── */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">รายการค่าใช้จ่ายที่บันทึกโดยคุณ</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                ประวัติรายการล่าสุด 5 รายการจากทั้งหมด {stats.tx_count} รายการ
              </p>
            </div>
            <Link
              to="/transactions"
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors"
            >
              <span>ดูรายการทั้งหมด</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 space-y-3">
              <CreditCard size={40} className="mx-auto text-gray-300" />
              <p className="text-base font-medium">ยังไม่มีรายการค่าใช้จ่ายที่บันทึกโดยบัญชีนี้</p>
              <Link
                to="/transactions"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
              >
                <span>บันทึกรายการแรกของคุณ</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">วันที่</th>
                    <th className="py-3 px-4">ประเภทค่าใช้จ่าย</th>
                    <th className="py-3 px-4">หมวดงบประมาณ</th>
                    <th className="py-3 px-4">รายละเอียด</th>
                    <th className="py-3 px-4 text-right">จำนวนเงิน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-gray-700 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                          {tx.expense_type_name || 'ไม่ระบุ'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {tx.budget_category_name || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 max-w-xs truncate">
                        {tx.description || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-gray-900 whitespace-nowrap">
                        ฿{parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
