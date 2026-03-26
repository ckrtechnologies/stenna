import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Footer from '../components/Footer';
import '../styles/StaticPages.css';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="faq-item">
            <button className="faq-question" onClick={() => setIsOpen(!isOpen)}>
                <h4>{question}</h4>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {isOpen && (
                <div className="faq-answer fade-in">
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
};

const FAQ = () => {
    const faqData = [
        {
            question: "What is a batch number?",
            answer: "A batch number is mentioned on every roll label that indicates the batch of wallpapers. Wallpapers are printed in batches and it is important that all your rolls are from the same batch to avoid any issues when your paper is hung. If you have rolls from mixed batches, this can result in small differences in pattern and colour which may be visible once the paper is hung."
        },
        {
            question: "What if I need another roll from a specific batch?",
            answer: "To place an order from a specific batch, you need to contact us at +91 99715 75710 or email digital@stenna.in. Our team will confirm the availability of stock and process your order."
        },
        {
            question: "What should I do if I want to Return the roll?",
            answer: "We have a 7-day return policy. To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You’ll also need the receipt or proof of purchase. To start a return, contact us at digital@stenna.in."
        },
        {
            question: "How do I track my order?",
            answer: "Once you place your order, an email will be sent to you with all the details along with a tracking number. You can track your order using the tracking number."
        },
        {
            question: "How do I cancel my order?",
            answer: "Cancellation of an order can only be done before dispatch. After dispatch, the standard return process will apply."
        },
        {
            question: "How should I pay for my order?",
            answer: "You can use the following methods to make payment: Debit Card, Credit Card, UPI, Wallet, and Cash on Delivery. All transactions are encrypted and secure."
        },
        {
            question: "How to clean my wallpaper?",
            answer: "Wallpapers can be cleaned with dry methods like vacuuming or dusting. If your wallpaper is washable, you can use a soft dish wash solution with water and wipe carefully. Always test the cleaning method on a small, inconspicuous area first."
        },
        {
            question: "What is Design Repeat?",
            answer: "The design repeat is the distance of the vertical recurrence of the wallpaper pattern (typically 0”-27”). Patterns with no repeats (like textures) have little waste, but larger designs may require more wallpaper to match the pattern from strip to strip."
        }
    ];

    return (
        <div className="static-page fade-in-up">
            {/* Global Menu Trigger */}
            <div 
                className="menu-trigger-global" 
                onClick={() => window.dispatchEvent(new CustomEvent('open-mega-menu'))}
                style={{ 
                    position: 'fixed', 
                    top: '30px', 
                    left: '30px', 
                    zIndex: 1000, 
                    cursor: 'pointer',
                    padding: '10px'
                }}
            >
                <div className="zara-hamburger">
                    <div className="bar"></div>
                    <div className="bar"></div>
                </div>
            </div>

            <header className="static-page-header">
                <div className="static-breadcrumb">
                    <Link to="/">HOME</Link> / <span>FAQs</span>
                </div>
                <h1>FREQUENTLY ASKED QUESTIONS</h1>
            </header>

            <section className="static-content-section">
                <h2>General Inquiries</h2>
                <div className="faq-list">
                    {faqData.map((item, index) => (
                        <FAQItem key={index} question={item.question} answer={item.answer} />
                    ))}
                </div>
            </section>

            <section className="static-content-section" style={{ textAlign: 'center', marginTop: '6rem' }}>
                <p className="static-text" style={{ color: '#888' }}>Unable to find satisfactory answers?</p>
                <Link to="/contact" className="btn-zara-primary" style={{ display: 'inline-block', textDecoration: 'none', marginTop: '1rem', padding: '1rem 3rem' }}>
                    CONTACT SUPPORT
                </Link>
            </section>
            <Footer style={{ marginTop: '0', backgroundColor: '#000' }} />
        </div>
    );
};

export default FAQ;
