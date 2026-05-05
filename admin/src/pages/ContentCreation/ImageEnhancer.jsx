import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { 
    Upload, 
    Sparkles, 
    Zap, 
    Maximize, 
    Image as ImageIcon,
    Loader2,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';

const ImageEnhancer = () => {
    const [selectedModel, setSelectedModel] = useState('topaz');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultImage, setResultImage] = useState(null);
    const [credits, setCredits] = useState(null);
    const [loadingCredits, setLoadingCredits] = useState(false);
    const [upscaleFactor, setUpscaleFactor] = useState("2");
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [resolution, setResolution] = useState('square_hd');
    const [renderingSpeed, setRenderingSpeed] = useState('BALANCED');
    const [style, setStyle] = useState('AUTO');
    const [seed, setSeed] = useState(0);
    const [status, setStatus] = useState('');
    const [taskId, setTaskId] = useState(null);

    useEffect(() => {
        fetchCredits();
    }, []);

    const fetchCredits = async () => {
        setLoadingCredits(true);
        try {
            const response = await api.get('/ai/credits');
            // Based on actual response: { code: 200, msg: "success", data: 9969.1 }
            if (response.data && response.data.data !== undefined) {
                setCredits(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching AI credits:', error);
        } finally {
            setLoadingCredits(false);
        }
    };

    const models = [
        { 
            id: 'topaz', 
            name: 'Topaz AI', 
            description: 'Professional upscaling & noise reduction.', 
            icon: <Maximize size={20} />,
            color: 'blue',
            endpoint: '/ai/topaz/upscale',
            statusEndpoint: '/ai/topaz/status'
        },
        { 
            id: 'recraft-crisp', 
            name: 'Recraft Crisp', 
            description: 'Detail-focused crisp upscaling.', 
            icon: <Sparkles size={20} />,
            color: 'orange',
            endpoint: '/ai/recraft/crisp-upscale',
            statusEndpoint: '/ai/recraft/status'
        }
    ];

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setResultImage(null);
        }
    };

    const handleEnhance = async () => {
        if (!image || isProcessing) return;
        
        setIsProcessing(true);
        setStatus('Uploading to VPS...');
        setResultImage(null);

        try {
            // 1. Upload to VPS
            const formData = new FormData();
            formData.append('image', image);
            formData.append('module', 'topaz');

            const uploadRes = await api.post('/upload/content', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (!uploadRes.data.url) throw new Error('Upload failed');
            const publicUrl = uploadRes.data.url;

            // 2. Create Task based on selected model
            const modelConfig = models.find(m => m.id === selectedModel);
            setStatus(`Initializing ${modelConfig.name}...`);

            let payload = { image_url: publicUrl };
            if (selectedModel === 'topaz') {
                payload.upscale_factor = upscaleFactor;
            } else if (selectedModel.startsWith('recraft')) {
                // Backend handles image/image_url mapping
                payload.image_url = publicUrl;
            }

            console.log(`Creating ${selectedModel} task with payload:`, payload);
            const taskRes = await api.post(modelConfig.endpoint, payload);

            if (taskRes.data.code !== 200) {
                throw new Error(taskRes.data.msg || 'Task creation failed');
            }

            const tid = taskRes.data.data.taskId;
            setTaskId(tid);
            setStatus('AI Processing...');

            // 3. Start Polling
            startPolling(tid, modelConfig.statusEndpoint);

        } catch (error) {
            console.error('Enhancement Error:', error);
            alert(error.response?.data?.message || error.message || 'Something went wrong');
            setIsProcessing(false);
            setStatus('');
        }
    };

    const startPolling = (tid, statusEndpoint) => {
        const interval = setInterval(async () => {
            try {
                const res = await api.get(`${statusEndpoint}?taskId=${tid}`);
                const { state, resultJson, failMsg } = res.data.data;

                if (state === 'success') {
                    clearInterval(interval);
                    const result = JSON.parse(resultJson);
                    console.log('AI Result Data:', result); // Diagnostic log

                    let finalUrl = null;

                    // 1. Try common resultUrls array (Topaz style)
                    if (result.resultUrls && result.resultUrls.length > 0) {
                        finalUrl = result.resultUrls[0];
                        // If Recraft Vector, prefer SVG in the array
                        if (selectedModel === 'recraft-vector') {
                            const svgUrl = result.resultUrls.find(url => url.toLowerCase().endsWith('.svg'));
                            if (svgUrl) finalUrl = svgUrl;
                        }
                    } 
                    // 2. Try Fal.ai style (image: { url: "..." })
                    else if (result.image && result.image.url) {
                        finalUrl = result.image.url;
                    }
                    // 3. Try direct image field (some other models)
                    else if (typeof result.image === 'string') {
                        finalUrl = result.image;
                    }
                    // 4. Fallback: try any string that looks like a URL
                    else {
                        const firstValue = Object.values(result).find(v => typeof v === 'string' && v.startsWith('http'));
                        if (firstValue) finalUrl = firstValue;
                    }

                    if (finalUrl) {
                        setResultImage(finalUrl);
                    } else {
                        alert('Task succeeded but no image URL was found in the result.');
                    }
                    
                    setIsProcessing(false);
                    setStatus('');
                    fetchCredits(); // Refresh credits after success
                } else if (state === 'fail') {
                    clearInterval(interval);
                    alert(`AI Processing Failed: ${failMsg}`);
                    setIsProcessing(false);
                    setStatus('');
                } else {
                    // Still processing or pending
                    console.log('Task state:', state);
                }
            } catch (error) {
                console.error('Polling Error:', error);
                // We don't stop on single error, might be network glitch
            }
        }, 3000); // 3 seconds interval
    };

    return (
        <div className="image-enhancer-page">
            <header className="page-header">
                <div>
                    <h1>Image Enhancer</h1>
                    <p>Select an AI model to upscale and refine your high-resolution assets.</p>
                </div>
                {credits !== null && (
                    <div className="credits-display">
                        <Zap size={14} className="zap-icon" />
                        <span className="credit-value">
                            {typeof credits === 'number' ? credits.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 }) : credits}
                        </span>
                        <span className="credit-label">Credits Remaining</span>
                        <button className="refresh-credits" onClick={fetchCredits} disabled={loadingCredits}>
                            <Loader2 size={12} className={loadingCredits ? 'animate-spin' : ''} />
                        </button>
                    </div>
                )}
            </header>

            <div className="enhancer-container">
                <div className="settings-panel">
                    <section className="section">
                        <label className="section-label">1. Select AI Model</label>
                        <div className="model-grid">
                            {models.map(model => (
                                <div 
                                    key={model.id}
                                    className={`model-card ${selectedModel === model.id ? 'active' : ''} ${model.color}`}
                                    onClick={() => setSelectedModel(model.id)}
                                >
                                    <div className="model-icon">{model.icon}</div>
                                    <div className="model-info">
                                        <h4>{model.name}</h4>
                                        <p>{model.description}</p>
                                    </div>
                                    {selectedModel === model.id && <CheckCircle2 className="check-icon" size={16} />}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="section">
                        <label className="section-label">2. Upload Asset</label>
                        <div className={`upload-zone ${preview ? 'has-file' : ''}`}>
                            <input 
                                type="file" 
                                id="asset-upload" 
                                accept="image/*" 
                                onChange={handleImageChange} 
                                hidden 
                            />
                            <label htmlFor="asset-upload" className="upload-label">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="upload-preview" />
                                ) : (
                                    <div className="upload-placeholder">
                                        <Upload size={32} />
                                        <span>Click or drag image to upload</span>
                                        <small>Supports PNG, JPG, WEBP (Max 10MB)</small>
                                    </div>
                                )}
                            </label>
                            {preview && (
                                <button className="change-btn" onClick={() => {setImage(null); setPreview(null);}}>
                                    Change Image
                                </button>
                            )}
                        </div>
                    </section>

                    {selectedModel === 'topaz' && (
                        <section className="section">
                            <label className="section-label">3. Topaz Settings</label>
                            <div className="settings-group">
                                <div className="setting-item">
                                    <label>Upscale Factor</label>
                                    <select 
                                        value={upscaleFactor} 
                                        onChange={(e) => setUpscaleFactor(e.target.value)}
                                        className="admin-select"
                                    >
                                        <option value="2">2x (Standard)</option>
                                        <option value="4">4x (High Resolution)</option>
                                        <option value="8">8x (Ultra Detail)</option>
                                    </select>
                                </div>
                            </div>
                        </section>
                    )}


                    {selectedModel === 'recraft-crisp' && (
                        <section className="section">
                            <label className="section-label">3. Crisp Settings</label>
                            <div className="settings-group">
                                <div className="setting-item">
                                    <label>Enhancement Mode</label>
                                    <div className="badge-selector">
                                        <span className="active">Detail Focused</span>
                                    </div>
                                    <small className="setting-hint">Preserves textures while increasing clarity.</small>
                                </div>
                            </div>
                        </section>
                    )}

                    <button 
                        className={`enhance-btn ${!image || isProcessing ? 'disabled' : ''}`}
                        onClick={handleEnhance}
                        disabled={!image || isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>Enhancing via {models.find(m => m.id === selectedModel).name}...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                <span>Enhance Image</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="result-panel">
                    <div className="card result-card">
                        {!resultImage && !isProcessing && (
                            <div className="empty-result">
                                <ImageIcon size={48} />
                                <p>Optimized image will appear here</p>
                            </div>
                        )}

                        {isProcessing && (
                            <div className="processing-overlay">
                                <div className="loader-ring"></div>
                                <p>{status || 'Running AI Algorithms...'}</p>
                                {taskId && <small className="task-id">Task ID: {taskId}</small>}
                            </div>
                        )}

                        {resultImage && !isProcessing && (
                            <div className="result-view">
                                <div className="result-header">
                                    <span className="badge badge-success">
                                        {selectedModel === 'recraft-vector' ? 'Vectorization Complete' : 'Successfully Enhanced'}
                                    </span>
                                    <a href={resultImage} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                                        Download {selectedModel === 'recraft-vector' ? 'SVG' : 'High-Res'}
                                    </a>
                                </div>
                                <div className="image-comparison">
                                    {selectedModel === 'recraft-vector' ? (
                                        <object data={resultImage} type="image/svg+xml" className="vector-output">
                                            <img src={resultImage} alt="Vector Result" />
                                        </object>
                                    ) : (
                                        <img src={resultImage} alt="Enhanced Result" />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .enhancer-container {
                    display: grid;
                    grid-template-columns: 400px 1fr;
                    gap: 1.5rem;
                    align-items: flex-start;
                }

                .settings-panel {
                    background: var(--bg-card);
                    padding: 1.25rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .settings-group {
                    background: var(--bg-input);
                    padding: 1rem;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                }

                .setting-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .setting-item label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-muted);
                }

                .admin-select {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    color: var(--text-main);
                    padding: 0.5rem;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    outline: none;
                }

                .badge-selector {
                    display: flex;
                    gap: 0.5rem;
                }

                .badge-selector span {
                    background: var(--primary);
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .setting-hint {
                    display: block;
                    margin-top: 0.5rem;
                    font-size: 0.7rem;
                    color: var(--text-dim);
                    line-height: 1.4;
                }

                .vector-output {
                    width: 100%;
                    height: 100%;
                    max-height: 500px;
                }

                .credits-display {
                    display: flex;
                    align-items: center;
                    gap: 0.625rem;
                    background: var(--bg-input);
                    padding: 0.5rem 0.875rem;
                    border-radius: 100px;
                    border: 1px solid var(--border-color);
                    font-size: 0.85rem;
                    color: var(--text-main);
                }

                .zap-icon {
                    color: #eab308;
                }

                .credit-value {
                    font-weight: 700;
                    color: var(--primary);
                }

                .credit-label {
                    color: var(--text-dim);
                    font-size: 0.75rem;
                }

                .refresh-credits {
                    background: none;
                    border: none;
                    color: var(--text-dim);
                    cursor: pointer;
                    display: flex;
                    padding: 2px;
                    margin-left: 4px;
                    border-radius: 4px;
                }

                .refresh-credits:hover {
                    color: var(--primary);
                    background: var(--bg-hover);
                }

                .section-label {
                    display: block;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: var(--text-dim);
                    margin-bottom: 1rem;
                    letter-spacing: 0.05em;
                }

                .model-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .model-card {
                    padding: 0.75rem 1rem;
                    background: var(--bg-input);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                }

                .model-card:hover {
                    border-color: var(--primary);
                    background: var(--bg-hover);
                }

                .model-card.active {
                    border-color: var(--primary);
                    background: rgba(59, 130, 246, 0.05);
                    box-shadow: 0 0 0 2px var(--primary);
                }

                .model-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                }

                .model-card.blue .model-icon { color: #3b82f6; }
                .model-card.purple .model-icon { color: #8b5cf6; }
                .model-card.orange .model-icon { color: #f59e0b; }
                .model-card.pink .model-icon { color: #ec4899; }

                .model-info h4 {
                    font-size: 0.9rem;
                    font-weight: 700;
                    margin: 0;
                    color: var(--text-main);
                }

                .model-info p {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    margin: 0.125rem 0 0;
                    line-height: 1.3;
                }

                .check-icon {
                    position: absolute;
                    top: 0.75rem;
                    right: 0.75rem;
                    color: var(--primary);
                }

                .upload-zone {
                    border: 2px dashed var(--border-color);
                    border-radius: 12px;
                    padding: 1.5rem;
                    text-align: center;
                    transition: all 0.2s ease;
                    background: var(--bg-input);
                    cursor: pointer;
                    position: relative;
                }

                .upload-zone:hover {
                    border-color: var(--primary);
                    background: var(--bg-hover);
                }

                .upload-zone.has-file {
                    border-style: solid;
                    padding: 0.5rem;
                }

                .upload-label {
                    cursor: pointer;
                    display: block;
                    width: 100%;
                }

                .upload-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-dim);
                }

                .upload-placeholder span {
                    font-weight: 600;
                    color: var(--text-muted);
                }

                .upload-preview {
                    width: 100%;
                    max-height: 200px;
                    object-fit: contain;
                    border-radius: 8px;
                }

                .change-btn {
                    margin-top: 0.5rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--danger);
                    background: transparent;
                    border: none;
                    cursor: pointer;
                }

                .enhance-btn {
                    width: 100%;
                    padding: 0.875rem;
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }

                .enhance-btn:hover:not(.disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
                }

                .enhance-btn.disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    filter: grayscale(0.5);
                }

                .result-card {
                    height: 100%;
                    min-height: 500px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    position: relative;
                    overflow: hidden;
                }

                .empty-result {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    color: var(--text-dim);
                }

                .processing-overlay {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .task-id {
                    font-size: 0.7rem;
                    color: var(--text-dim);
                    font-family: monospace;
                    background: var(--bg-input);
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                }

                .loader-ring {
                    width: 48px;
                    height: 48px;
                    border: 3px solid var(--border-color);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .result-view {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .result-header {
                    padding: 1rem;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .image-comparison {
                    flex: 1;
                    background: #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                    overflow: hidden;
                }

                .image-comparison img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    box-shadow: 0 0 40px rgba(0,0,0,0.5);
                }

                .animate-spin {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 1024px) {
                    .enhancer-container {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default ImageEnhancer;
