import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import Footer from '../../components/Footer';
import axios from '../../api/axios';
import { Trophy, Users, BookOpen, Mail, Phone } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const AboutPage = () => {
    const [about, setAbout] = useState(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    useEffect(() => {
        fetchAbout();
    }, []);

    const fetchAbout = async () => {
        try {
            const response = await axios.get('/about');
            setAbout(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching about:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: theme.bgPrimary }}>
                <PublicNavbar />
                <div className="flex items-center justify-center h-96">
                    <div className="w-10 h-10 rounded-full border-2 animate-spin"
                        style={{ borderColor: theme.borderDefault, borderTopColor: theme.accent }} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: theme.bgPrimary }}>
            <PublicNavbar />

            {/* Header */}
            <div className="py-12 px-4 text-center" style={{ borderBottom: `1px solid ${theme.borderDefault}` }}>
                <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: theme.textPrimary }}>
                    About Institute Gathering
                </h1>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                    Celebrating Excellence
                </p>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Description */}
                <div className="rounded-xl p-6 mb-6"
                    style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.borderDefault}` }}>
                    <p className="leading-relaxed" style={{ color: theme.textSecondary }}>
                        {about?.description}
                    </p>
                </div>

                {/* Vision and Mission */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="rounded-xl p-6"
                        style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.borderDefault}` }}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: theme.accentSubtle }}>
                                <span className="text-lg">🎯</span>
                            </div>
                            <h3 className="font-semibold" style={{ color: theme.textPrimary }}>Mission</h3>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary }}>
                            {about?.missionStatement}
                        </p>
                    </div>

                    <div className="rounded-xl p-6"
                        style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.borderDefault}` }}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: theme.accentSubtle }}>
                                <span className="text-lg">👁️</span>
                            </div>
                            <h3 className="font-semibold" style={{ color: theme.textPrimary }}>Vision</h3>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary }}>
                            {about?.visionStatement}
                        </p>
                    </div>
                </div>

                {/* History */}
                {about?.history && (
                    <div className="rounded-xl p-6 mb-6"
                        style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.borderDefault}` }}>
                        <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-5 h-5" style={{ color: theme.accent }} />
                            <h3 className="font-semibold" style={{ color: theme.textPrimary }}>History</h3>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary }}>
                            {about.history}
                        </p>
                    </div>
                )}

                {/* Highlights */}
                {about?.highlights && about.highlights.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-semibold mb-4" style={{ color: theme.textPrimary }}>Event Highlights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {about.highlights.map((highlight, index) => (
                                <div key={index} className="rounded-xl p-4"
                                    style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.borderDefault}` }}>
                                    <h4 className="font-medium mb-2" style={{ color: theme.textPrimary }}>
                                        {highlight.title}
                                    </h4>
                                    <p className="text-sm" style={{ color: theme.textMuted }}>
                                        {highlight.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Contact */}
                <div className="rounded-xl p-6 mb-6"
                    style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.borderDefault}` }}>
                    <h3 className="font-semibold mb-4" style={{ color: theme.textPrimary }}>Contact</h3>
                    <div className="space-y-3">
                        {about?.contactEmail && (
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4" style={{ color: theme.textMuted }} />
                                <span className="text-sm" style={{ color: theme.textSecondary }}>{about.contactEmail}</span>
                            </div>
                        )}
                        {about?.contactPhone && (
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4" style={{ color: theme.textMuted }} />
                                <span className="text-sm" style={{ color: theme.textSecondary }}>{about.contactPhone}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-3 justify-center">
                    <Link
                        to="/student-council"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                        style={{ backgroundColor: theme.accent, color: theme.bgPrimary }}
                    >
                        <Users className="w-4 h-4" />
                        Student Council
                    </Link>
                    <Link
                        to="/leaderboard"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                        style={{ backgroundColor: theme.bgSecondary, color: theme.textSecondary, border: `1px solid ${theme.borderDefault}` }}
                    >
                        <Trophy className="w-4 h-4" />
                        Leaderboard
                    </Link>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AboutPage;
