import PublicNavbar from '../../components/PublicNavbar';
import Footer from '../../components/Footer';
import ContactSection from '../../components/ContactSection';

export default function Contact() {
    return (
        <>
            <PublicNavbar />
            <div style={{ marginTop: '80px' }}>
                <ContactSection />
            </div>
            <Footer />
        </>
    );
}
