import { Loader2 } from 'lucide-react';

const Loader = ({ fullPage = false, message = "Loading..." }) => {
    if (fullPage) {
        return (
            <div className="loader-overlay">
                <div className="loader-content">
                    <Loader2 className="spinner" size={40} />
                    <p>{message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="loader-inline">
            <Loader2 className="spinner" size={24} />
            <span>{message}</span>
        </div>
    );
};

export default Loader;
