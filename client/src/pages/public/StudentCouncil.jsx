import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PublicNavbar from '../../components/PublicNavbar';
import Footer from '../../components/Footer';
import axios from '../../api/axios';
import { GraduationCap, ArrowLeft, User, Filter, X, Mail, Phone, Quote } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const StudentCouncilPage = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDept, setFilterDept] = useState('ALL');
    const { theme } = useTheme();

    useEffect(() => { fetchMembers(); }, []);

    const fetchMembers = async () => {
        try {
            const response = await axios.get('/student-council');
            // Sort by order field (set from backend)
            const sortedMembers = (response.data.data || []).sort((a, b) => (a.order || 99) - (b.order || 99));
            setMembers(sortedMembers);
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    /** Resolve photo path — handles /uploads/... , http URLs, or null */
    const getPhotoUrl = (photoPath) => {
        if (!photoPath || photoPath === 'undefined' || photoPath.includes('undefined')) return null;
        if (photoPath.startsWith('http')) return photoPath;
        if (photoPath.startsWith('data:')) return photoPath;
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
        return `${baseUrl}${photoPath}`;
    };

    // Get unique departments
    const departments = ['ALL', ...new Set(members.map(m => m.department).filter(Boolean))];

    // Filter by department
    const filteredMembers = filterDept === 'ALL' ? members : members.filter(m => m.department === filterDept);

    // Group: top leader (General Secretary), and all other secretaries/representatives
    const topLeader = filteredMembers.filter(m =>
        m.position?.toLowerCase() === 'general secretary'
    );
    const secretaries = filteredMembers.filter(m =>
        m.position?.toLowerCase() !== 'general secretary'
    );

    /** Reusable avatar component — xl for hero, lg for cards */
    const Avatar = ({ photo, name, size = 'md' }) => {
        const [imgFailed, setImgFailed] = React.useState(false);
        const sizeMap = {
            sm: 'w-14 h-14 sm:w-16 sm:h-16',
            md: 'w-24 h-24 sm:w-28 sm:h-28',
            lg: 'w-28 h-28 sm:w-36 sm:h-36',
            xl: 'w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48',
        };
        const iconMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-10 h-10', xl: 'w-14 h-14' };
        const url = getPhotoUrl(photo);
        const showImg = url && !imgFailed;
        return (
            <div
                className={`${sizeMap[size]} rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ring-2`}
                style={{ backgroundColor: theme.accentSubtle, ringColor: theme.borderStrong }}
            >
                {showImg && (
                    <img
                        src={url}
                        alt={name}
                        className="w-full h-full rounded-full object-cover"
                        onError={() => setImgFailed(true)}
                    />
                )}
                {!showImg && (
                    <div
                        className="flex items-center justify-center w-full h-full"
                        style={{ color: theme.accent }}
                    >
                        <User className={iconMap[size]} />
                    </div>
                )}
            </div>
        );
    };

    const cardAnim = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

    if (loading) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: theme.bgPrimary }}>
                <PublicNavbar />
                <div className="flex flex-col items-center justify-center h-96">
                    <div
                        className="w-10 h-10 rounded-full border-2 animate-spin"
                        style={{ borderColor: theme.borderDefault, borderTopColor: theme.accent }}
                    />
                    <p className="mt-4 text-sm" style={{ color: theme.textMuted }}>Loading council members…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: theme.bgPrimary }}>
            <PublicNavbar />

            {/* Hero Header */}
            <div className="py-12 sm:py-16 px-4 text-center relative overflow-hidden" style={{ borderBottom: `1px solid ${theme.borderDefault}` }}>
                <div className="absolute inset-0 opacity-[0.04]" style={{ background: `radial-gradient(circle at 50% 0%, ${theme.accent}, transparent 70%)` }} />
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <GraduationCap className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4" style={{ color: theme.accent }} />
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 tracking-tight" style={{ color: theme.textPrimary }}>
                        Student Council
                    </h1>
                    <p className="text-sm sm:text-base max-w-md mx-auto" style={{ color: theme.textMuted }}>
                        The leadership driving Institute Gathering '26
                    </p>
                </motion.div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

                {/* Department Filter */}
                {members.length > 0 && departments.length > 2 && (
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-3">
                            <Filter className="w-4 h-4" style={{ color: theme.textMuted }} />
                            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                                Filter by Department
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {departments.map(dept => (
                                <button
                                    key={dept}
                                    onClick={() => setFilterDept(dept)}
                                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                                    style={{
                                        backgroundColor: filterDept === dept ? theme.accent : theme.bgSecondary,
                                        color: filterDept === dept ? theme.bgPrimary : theme.textSecondary,
                                        border: `1px solid ${filterDept === dept ? theme.accent : theme.borderDefault}`,
                                    }}
                                >
                                    {dept === 'ALL' ? 'All' : dept}
                                </button>
                            ))}
                            {filterDept !== 'ALL' && (
                                <button
                                    onClick={() => setFilterDept('ALL')}
                                    className="px-2 py-1.5 rounded-full text-xs transition-all"
                                    style={{ color: theme.textMuted }}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {filteredMembers.length === 0 ? (
                    <div
                        className="text-center py-16 rounded-2xl"
                        style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.borderDefault}` }}
                    >
                        <GraduationCap className="w-14 h-14 mx-auto mb-4 opacity-40" style={{ color: theme.textMuted }} />
                        <p className="text-base font-medium" style={{ color: theme.textMuted }}>
                            {filterDept !== 'ALL' ? `No members from ${filterDept}` : 'No council members found'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* ── General Secretary — Hero Card ── */}
                        {topLeader.length > 0 && (
                            <section className="mb-10">
                                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-5 flex items-center gap-2"
                                    style={{ color: theme.accent }}>
                                    <span className="w-8 h-[2px] rounded-full" style={{ backgroundColor: theme.accent }} />
                                    General Secretary
                                </h2>
                                {topLeader.map((member, i) => (
                                    <motion.div
                                        key={member._id}
                                        {...cardAnim}
                                        transition={{ ...cardAnim.transition, delay: i * 0.08 }}
                                        className="rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center transition-all duration-200 hover:shadow-lg"
                                        style={{
                                            backgroundColor: theme.bgSecondary,
                                            border: `1px solid ${theme.borderDefault}`,
                                        }}
                                    >
                                        <Avatar photo={member.photo} name={member.name} size="xl" />
                                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mt-4 leading-tight" style={{ color: theme.textPrimary }}>
                                            {member.name}
                                        </h3>
                                        <p className="text-sm sm:text-base font-semibold mt-1" style={{ color: theme.accent }}>
                                            {member.position}
                                        </p>
                                        <p className="text-xs sm:text-sm mt-1 font-medium" style={{ color: theme.textMuted }}>
                                            {member.department}
                                        </p>
                                        {member.pledge && (
                                            <p className="text-xs sm:text-sm mt-3 italic leading-relaxed max-w-lg flex items-start gap-1.5"
                                                style={{ color: theme.textSecondary }}>
                                                <Quote className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-50" />
                                                <span>{member.pledge}</span>
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 mt-3">
                                            {member.email && (
                                                <a href={`mailto:${member.email}`} title={member.email}
                                                   className="flex items-center gap-1.5 text-xs transition-colors hover:opacity-80"
                                                   style={{ color: theme.textMuted }}>
                                                    <Mail className="w-4 h-4" /> Email
                                                </a>
                                            )}
                                            {member.phone && (
                                                <a href={`tel:${member.phone}`} title={member.phone}
                                                   className="flex items-center gap-1.5 text-xs transition-colors hover:opacity-80"
                                                   style={{ color: theme.textMuted }}>
                                                    <Phone className="w-4 h-4" /> {member.phone}
                                                </a>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </section>
                        )}

                        {/* ── Secretaries & Representatives ── */}
                        {secretaries.length > 0 && (
                            <section className="mb-10">
                                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-5 flex items-center gap-2"
                                    style={{ color: theme.accent }}>
                                    <span className="w-8 h-[2px] rounded-full" style={{ backgroundColor: theme.accent }} />
                                    Secretaries & Representatives
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                                    {secretaries.map((member, i) => (
                                        <motion.div
                                            key={member._id}
                                            {...cardAnim}
                                            transition={{ ...cardAnim.transition, delay: i * 0.06 }}
                                            className="rounded-2xl p-5 sm:p-6 flex flex-col items-center text-center transition-all duration-200 hover:shadow-lg"
                                            style={{
                                                backgroundColor: theme.bgSecondary,
                                                border: `1px solid ${theme.borderDefault}`,
                                            }}
                                        >
                                            <Avatar photo={member.photo} name={member.name} size="lg" />
                                            <h3 className="text-sm sm:text-base font-bold mt-3 leading-tight" style={{ color: theme.textPrimary }}>
                                                {member.name}
                                            </h3>
                                            <p className="text-xs sm:text-sm font-semibold mt-1" style={{ color: theme.accent }}>
                                                {member.position}
                                            </p>
                                            <p className="text-xs mt-1 font-medium" style={{ color: theme.textMuted }}>
                                                {member.department}
                                            </p>
                                            {member.pledge && (
                                                <p className="text-[11px] sm:text-xs mt-2 italic leading-relaxed line-clamp-2 max-w-xs"
                                                    style={{ color: theme.textSecondary }}>
                                                    "{member.pledge}"
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3 mt-2">
                                                {member.email && (
                                                    <a href={`mailto:${member.email}`} title={member.email}>
                                                        <Mail className="w-3.5 h-3.5 transition-colors hover:opacity-80" style={{ color: theme.textMuted }} />
                                                    </a>
                                                )}
                                                {member.phone && (
                                                    <a href={`tel:${member.phone}`} title={member.phone}>
                                                        <Phone className="w-3.5 h-3.5 transition-colors hover:opacity-80" style={{ color: theme.textMuted }} />
                                                    </a>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}

                {/* Back Button */}
                <div className="text-center mt-6">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-80"
                        style={{ color: theme.textSecondary, backgroundColor: theme.bgSecondary, border: `1px solid ${theme.borderDefault}` }}
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default StudentCouncilPage;
