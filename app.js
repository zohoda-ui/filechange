document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const fileListContainer = document.getElementById('fileListContainer');
    const fileCount = document.getElementById('fileCount');
    const downloadBtn = document.getElementById('downloadBtn');
    
    // Config Inputs
    const prefixInput = document.getElementById('prefix');
    const startNumberInput = document.getElementById('startNumber');
    const paddingInput = document.getElementById('padding');

    let files = [];

    // Trigger file input on click
    dropZone.addEventListener('click', () => fileInput.click());

    // Handle drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Listen for config changes to update preview
    [prefixInput, startNumberInput, paddingInput].forEach(input => {
        input.addEventListener('input', updateUI);
    });

    function handleFiles(newFiles) {
        const imageFiles = Array.from(newFiles).filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            alert('이미지 파일만 업로드 가능합니다.');
            return;
        }

        files = [...files, ...imageFiles];
        updateUI();
    }

    function getNewFileName(index) {
        const prefix = prefixInput.value || '사진';
        const startNum = parseInt(startNumberInput.value) || 0;
        const padding = parseInt(paddingInput.value) || 1;
        
        const number = (startNum + index).toString().padStart(padding, '0');
        const originalFile = files[index];
        const extension = originalFile.name.split('.').pop();
        
        return `${prefix}_${number}.${extension}`;
    }

    function updateUI() {
        if (files.length > 0) {
            fileListContainer.style.display = 'block';
            fileCount.textContent = files.length;
        } else {
            fileListContainer.style.display = 'none';
        }

        fileList.innerHTML = '';
        files.forEach((file, index) => {
            const newName = getNewFileName(index);
            const li = document.createElement('li');
            li.className = 'file-item';
            
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            
            li.innerHTML = `
                <img src="${previewUrl}" class="preview" alt="preview">
                <div class="file-info">
                    <span class="new-name">${newName}</span>
                    <span class="old-name">${file.name}</span>
                </div>
            `;
            fileList.appendChild(li);
        });
    }

    downloadBtn.addEventListener('click', async () => {
        if (files.length === 0) return;

        downloadBtn.disabled = true;
        downloadBtn.textContent = '압축 중...';

        try {
            const zip = new JSZip();
            
            files.forEach((file, index) => {
                const newName = getNewFileName(index);
                zip.file(newName, file);
            });

            const content = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `${prefixInput.value || 'renamed_images'}.zip`;
            link.click();
            
            // UI Feedback
            downloadBtn.textContent = '다운로드 완료!';
            setTimeout(() => {
                downloadBtn.textContent = '일괄 변경 및 다운로드 (ZIP)';
                downloadBtn.disabled = false;
            }, 2000);

        } catch (error) {
            console.error('ZIP creation failed:', error);
            alert('파일 압축 중 오류가 발생했습니다.');
            downloadBtn.disabled = false;
            downloadBtn.textContent = '일괄 변경 및 다운로드 (ZIP)';
        }
    });
});
