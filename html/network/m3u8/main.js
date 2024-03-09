
new Vue({
    el: '#m-app',
    data() {
        return {
            url: '', // 在线链接
            tips: 'm3u8 TS视频在线提取工具', // 顶部提示
            title: '', // 视频标题
            isPause: false, // 是否暂停下载
            isGetMP4: false, // 是否转码为 MP4 下载
            durationSecond: 0, // 视频持续时长
            downloading: false, // 是否下载中
            beginTime: '', // 开始下载的时间
            errorNum: 0, // 错误数
            finishNum: 0, // 已下载数
            downloadIndex: 0, // 当前下载片段
            finishList: [], // 下载完成项目
            tsUrlList: [], // ts URL数组
            mediaFileList: [], // 下载的媒体数组
            isSupperStreamWrite: window.streamSaver && !window.streamSaver.useBlobFallback, // 当前浏览器是否支持流式下载
            streamWriter: null, // 文件流写入器
            streamDownloadIndex: 0, // 文件流写入器，正准备写入第几个视频片段
            rangeDownload: { // 特定范围下载
                isShowRange: false, // 是否显示范围下载
                startSegment: '', // 起始片段
                endSegment: '', // 截止片段
                targetSegment: 1, // 待下载片段
            },
            aesConf: { // AES 视频解密配置
                method: '', // 加密算法
                uri: '', // key 所在文件路径
                iv: '', // 偏移值
                key: '', // 秘钥
                decryptor: null, // 解码器对象

                stringToBuffer: function (str) {
                    return new TextEncoder().encode(str)
                },
            },
        }
    },

    created() {
        this.getSource();
        window.addEventListener('keyup', this.onKeyup)
        setInterval(this.retryAll.bind(this), 2000) // 每两秒重新下载一遍错误片段，实现错误自动重试
    },

    beforeDestroy() {
        window.removeEventListener('keyup', this.onKeyup)
    },

    methods: {
        // 获取链接中携带的资源链接
        getSource() {
            let urll = new URL(location.href);
            if (urll.searchParams.get('url')) {
                this.url = decodeURIComponent(urll.searchParams.get('url'));
            }
            if (urll.searchParams.get('title')) {
                this.title = decodeURIComponent(urll.searchParams.get('title'));
            }
        },

        // 获取顶部 window title，因可能存在跨域问题，故使用 try catch 进行保护
        getDocumentTitle(){
            let title = document.title;
            try {
                title = window.top.document.title
            } catch (error) {
                console.log(error)
            }
            return title
        },

        // 退出弹窗
        onKeyup(event) {
            if (event.keyCode === 13) { // 键入ESC
                this.getM3U8()
            }
        },

        // ajax 请求
        ajax(options) {
            options = options || {};
            let xhr = new XMLHttpRequest();
            if (options.type === 'file') {
                xhr.responseType = 'arraybuffer';
            }

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    let status = xhr.status;
                    if (status >= 200 && status < 300) {
                        options.success && options.success(xhr.response);
                    } else {
                        options.fail && options.fail(status);
                    }
                }
            };

            xhr.open("GET", options.url, true);
            xhr.send(null);
        },

        // 合成URL
        applyURL(targetURL, baseURL) {
            baseURL = baseURL || location.href
            if (targetURL.indexOf('http') === 0) {
                // 当前页面使用 https 协议时，强制使 ts 资源也使用 https 协议获取
                if(location.href.indexOf('https') === 0){
                    return targetURL.replace('http://','https://')
                }
                return targetURL
            } else if (targetURL[0] === '/') {
                let domain = baseURL.split('/')
                return domain[0] + '//' + domain[2] + targetURL
            } else {
                let domain = baseURL.split('/')
                domain.pop()
                return domain.join('/') + '/' + targetURL
            }
        },

        // 使用流式下载，边下载边保存，解决大视频文件内存不足的难题
        streamDownload(isMp4){
            this.isGetMP4 = isMp4
            this.title = new URL(this.url).searchParams.get('title') || this.title // 获取视频标题
            let fileName = this.title || this.formatTime(new Date(), 'YYYY_MM_DD hh_mm_ss')
            if(document.title !== 'm3u8 downloader'){
                fileName = this.getDocumentTitle()
            }
            this.streamWriter = window.streamSaver.createWriteStream(`${fileName}.${isMp4 ? 'mp4' : 'ts'}`).getWriter()
            this.getM3U8()
        },

        // 解析为 mp4 下载
        getMP4() {
            this.isGetMP4 = true
            this.getM3U8()
        },

        // 获取在线文件
        getM3U8(onlyGetRange) {
            if (!this.url) {
                alert('请输入链接')
                return
            }
            if (this.url.toLowerCase().indexOf('m3u8') === -1) {
                alert('链接有误，请重新输入')
                return
            }
            if (this.downloading) {
                alert('资源下载中，请稍后')
                return
            }

            this.title = new URL(this.url).searchParams.get('title') || this.title // 获取视频标题
            this.tips = 'm3u8 文件下载中，请稍后'
            this.beginTime = new Date()
            this.ajax({
                url: this.url,
                success: (m3u8Str) => {
                    this.tsUrlList = []
                    this.finishList = []

                    // 提取 ts 视频片段地址
                    m3u8Str.split('\n').forEach((item) => {
                        // if (/.(png|image|ts|jpg|mp4|jpeg)/.test(item)) {
                        // 放开片段后缀限制，下载非 # 开头的链接片段
                        if (/^[^#]/.test(item)) {
                            console.log(item)
                            this.tsUrlList.push(this.applyURL(item, this.url))
                            this.finishList.push({
                                title: item,
                                status: ''
                            })
                        }
                    })

                    // 仅获取视频片段数
                    if (onlyGetRange) {
                        this.rangeDownload.isShowRange = true
                        this.rangeDownload.endSegment = this.tsUrlList.length
                        this.rangeDownload.targetSegment = this.tsUrlList.length
                        return
                    } else {
                        let startSegment = Math.max(this.rangeDownload.startSegment || 1, 1) // 最小为 1
                        let endSegment = Math.max(this.rangeDownload.endSegment || this.tsUrlList.length, 1)
                        startSegment = Math.min(startSegment, this.tsUrlList.length) // 最大为 this.tsUrlList.length
                        endSegment = Math.min(endSegment, this.tsUrlList.length)
                        this.rangeDownload.startSegment = Math.min(startSegment, endSegment)
                        this.rangeDownload.endSegment = Math.max(startSegment, endSegment)
                        this.rangeDownload.targetSegment = this.rangeDownload.endSegment - this.rangeDownload.startSegment + 1
                        this.downloadIndex = this.rangeDownload.startSegment - 1
                        this.downloading = true
                    }

                    // 获取需要下载的 MP4 视频长度
                    if (this.isGetMP4) {
                        let infoIndex = 0
                        m3u8Str.split('\n').forEach(item => {
                            if (item.toUpperCase().indexOf('#EXTINF:') > -1) { // 计算视频总时长，设置 mp4 信息时使用
                                infoIndex++
                                if (this.rangeDownload.startSegment <= infoIndex && infoIndex <= this.rangeDownload.endSegment) {
                                    this.durationSecond += parseFloat(item.split('#EXTINF:')[1])
                                }
                            }
                        })
                    }

                    // 检测视频 AES 加密
                    if (m3u8Str.indexOf('#EXT-X-KEY') > -1) {
                        this.aesConf.method = (m3u8Str.match(/(.*METHOD=([^,\s]+))/) || ['', '', ''])[2]
                        this.aesConf.uri = (m3u8Str.match(/(.*URI="([^"]+))"/) || ['', '', ''])[2]
                        this.aesConf.iv = (m3u8Str.match(/(.*IV=([^,\s]+))/) || ['', '', ''])[2]
                        this.aesConf.iv = this.aesConf.iv ? this.aesConf.stringToBuffer(this.aesConf.iv) : ''
                        this.aesConf.uri = this.applyURL(this.aesConf.uri, this.url)

                        // let params = m3u8Str.match(/#EXT-X-KEY:([^,]*,?METHOD=([^,]+))?([^,]*,?URI="([^,]+)")?([^,]*,?IV=([^,^\n]+))?/)
                        // this.aesConf.method = params[2]
                        // this.aesConf.uri = this.applyURL(params[4], this.url)
                        // this.aesConf.iv = params[6] ? this.aesConf.stringToBuffer(params[6]) : ''
                        this.getAES();
                    } else if (this.tsUrlList.length > 0) { // 如果视频没加密，则直接下载片段，否则先下载秘钥
                        this.downloadTS()
                    } else {
                        this.alertError('资源为空，请查看链接是否有效')
                    }
                },
                fail: () => {
                    this.alertError('链接不正确，请查看链接是否有效')
                }
            })
        },

        // 获取AES配置
        getAES() {
            // alert('视频被 AES 加密，点击确认，进行视频解码')
            this.ajax({
                type: 'file',
                url: this.aesConf.uri,
                success: (key) => {
                    // console.log('getAES', key)
                    // this.aesConf.key = this.aesConf.stringToBuffer(key)
                    this.aesConf.key = key
                    this.aesConf.decryptor = new AESDecryptor()
                    this.aesConf.decryptor.constructor()
                    this.aesConf.decryptor.expandKey(this.aesConf.key);
                    this.downloadTS()
                },
                fail: () => {
                    this.alertError('视频已加密，可试用右下角入口的「无差别提取工具」')
                }
            })
        },

        // ts 片段的 AES 解码
        aesDecrypt(data, index) {
            let iv = this.aesConf.iv || new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, index])
            return this.aesConf.decryptor.decrypt(data, 0, iv.buffer || iv, true)
        },

        // 下载分片
        downloadTS() {
            this.tips = 'ts 视频碎片下载中，请稍后'
            let download = () => {
                let isPause = this.isPause // 使用另一个变量来保持下载前的暂停状态，避免回调后没修改
                let index = this.downloadIndex
                if (index >= this.rangeDownload.endSegment) {
                    return
                }
                this.downloadIndex++
                if (this.finishList[index] && this.finishList[index].status === '') {
                    this.finishList[index].status = 'downloading'
                    this.ajax({
                        url: this.tsUrlList[index],
                        type: 'file',
                        success: (file) => {
                            this.dealTS(file, index, () => this.downloadIndex < this.rangeDownload.endSegment && !isPause && download())
                        },
                        fail: () => {
                            this.errorNum++
                            this.finishList[index].status = 'error'
                            if (this.downloadIndex < this.rangeDownload.endSegment) {
                                !isPause && download()
                            }
                        }
                    })
                } else if (this.downloadIndex < this.rangeDownload.endSegment) { // 跳过已经成功的片段
                    !isPause && download()
                }
            }

            // 建立多少个 ajax 线程
            for (let i = 0; i < Math.min(6, this.rangeDownload.targetSegment - this.finishNum); i++) {
                download()
            }
        },

        // 处理 ts 片段，AES 解密、mp4 转码
        dealTS(file, index, callback) {
            const data = this.aesConf.uri ? this.aesDecrypt(file, index) : file
            this.conversionMp4(data, index, (afterData) => { // mp4 转码
                this.mediaFileList[index - this.rangeDownload.startSegment + 1] = afterData // 判断文件是否需要解密
                this.finishList[index].status = 'finish'
                this.finishNum++
                if (this.streamWriter){
                    for (let index = this.streamDownloadIndex; index < this.mediaFileList.length; index++) {
                        if(this.mediaFileList[index]){
                            this.streamWriter.write(new Uint8Array(this.mediaFileList[index]))
                            this.mediaFileList[index] = null
                            this.streamDownloadIndex = index + 1
                        } else {
                            break
                        }
                    }
                    if (this.streamDownloadIndex >= this.rangeDownload.targetSegment){
                        this.streamWriter.close()
                    }
                } else if (this.finishNum === this.rangeDownload.targetSegment) {
                    let fileName = this.title || this.formatTime(this.beginTime, 'YYYY_MM_DD hh_mm_ss')
                    if(document.title !== 'm3u8 downloader'){
                        fileName = this.getDocumentTitle()
                    }
                    this.downloadFile(this.mediaFileList, fileName)
                }
                callback && callback()
            })
        },

        // 转码为 mp4
        conversionMp4(data, index, callback) {
            if (this.isGetMP4) {
                let transmuxer = new muxjs.Transmuxer({
                    keepOriginalTimestamps: true,
                    duration: parseInt(this.durationSecond),
                });
                transmuxer.on('data', segment => {
                    if (index === this.rangeDownload.startSegment - 1) {
                        let data = new Uint8Array(segment.initSegment.byteLength + segment.data.byteLength);
                        data.set(segment.initSegment, 0);
                        data.set(segment.data, segment.initSegment.byteLength);
                        callback(data.buffer)
                    } else {
                        callback(segment.data)
                    }
                })
                transmuxer.push(new Uint8Array(data));
                transmuxer.flush();
            } else {
                callback(data)
            }
        },

        // 暂停与恢复
        togglePause() {
            this.isPause = !this.isPause
            !this.isPause && this.retryAll(true)
        },

        // 重新下载某个片段
        retry(index) {
            if (this.finishList[index].status === 'error') {
                this.finishList[index].status = ''
                this.ajax({
                    url: this.tsUrlList[index],
                    type: 'file',
                    success: (file) => {
                        this.errorNum--
                        this.dealTS(file, index)
                    },
                    fail: () => {
                        this.finishList[index].status = 'error'
                    }
                })
            }
        },

        // 重新下载所有错误片段
        retryAll(forceRestart) {

            if (!this.finishList.length || this.isPause) {
                return
            }

            let firstErrorIndex = this.downloadIndex // 没有错误项目，则每次都递增
            this.finishList.forEach((item, index) => { // 重置所有错误片段状态
                if (item.status === 'error') {
                    item.status = ''
                    firstErrorIndex = Math.min(firstErrorIndex, index)
                }
            })
            this.errorNum = 0
            // 已经全部下载进程都跑完了，则重新启动下载进程
            if (this.downloadIndex >= this.rangeDownload.endSegment || forceRestart) {
                this.downloadIndex = firstErrorIndex
                this.downloadTS()
            } else { // 否则只是将下载索引，改为最近一个错误的项目，从那里开始遍历
                this.downloadIndex = firstErrorIndex
            }
        },

        // 下载整合后的TS文件
        downloadFile(fileDataList, fileName) {
            this.tips = 'ts 碎片整合中，请留意浏览器下载'
            let fileBlob = null
            let a = document.createElement('a')
            if (this.isGetMP4) {
                fileBlob = new Blob(fileDataList, { type: 'video/mp4' }) // 创建一个Blob对象，并设置文件的 MIME 类型
                a.download = fileName + '.mp4'
            } else {
                fileBlob = new Blob(fileDataList, { type: 'video/MP2T' }) // 创建一个Blob对象，并设置文件的 MIME 类型
                a.download = fileName + '.ts'
            }
            a.href = URL.createObjectURL(fileBlob)
            a.style.display = 'none'
            document.body.appendChild(a)
            a.click()
            a.remove()
        },

        // 格式化时间
        formatTime(date, formatStr) {
            const formatType = {
                Y: date.getFullYear(),
                M: date.getMonth() + 1,
                D: date.getDate(),
                h: date.getHours(),
                m: date.getMinutes(),
                s: date.getSeconds(),
            }
            return formatStr.replace(
                /Y+|M+|D+|h+|m+|s+/g,
                target => (new Array(target.length).join('0') + formatType[target[0]]).substr(-target.length)
            )
        },

        // 强制下载现有片段
        forceDownload() {
            if (this.mediaFileList.length) {
                let fileName = this.title || this.formatTime(this.beginTime, 'YYYY_MM_DD hh_mm_ss')
                if(document.title !== 'm3u8 downloader'){
                    fileName = this.getDocumentTitle()
                }
                this.downloadFile(this.mediaFileList, fileName)
            } else {
                alert('当前无已下载片段')
            }
        },

        // 发生错误，进行提示
        alertError(tips) {
            alert(tips)
            this.downloading = false
            this.tips = 'm3u8 视频在线提取工具';
        },

        // 拷贝本页面本身，解决跨域问题
        copyCode() {
            if (this.tips !== '代码下载中，请稍后') {
                this.tips = '代码下载中，请稍后';
                this.ajax({
                    url: './index.html',
                    success: (fileStr) => {
                        let fileList = fileStr.split(`<!--vue 前端框架--\>`);
                        let dom = fileList[0];
                        let script = fileList[1] + fileList[2];
                        script = script.split('// script注入');
                        script = script[1] + script[2];

                        if (this.url) {
                            script = script.replace(`url: '', // 在线链接`, `url: '${this.url}',`);
                        }

                        let codeStr = `
          // 注入html
          let $section = document.createElement('section')
          $section.innerHTML = \`${dom}\`
          $section.style.width = '100%'
          $section.style.height = '800px'
          $section.style.top = '0'
          $section.style.left = '0'
          $section.style.position = 'relative'
          $section.style.zIndex = '9999'
          $section.style.backgroundColor = 'white'
          document.body.appendChild($section);

          // 加载 ASE 解密
          let $ase = document.createElement('script')
          $ase.src = 'https://upyun.luckly-mjw.cn/lib/aes-decryptor.js'

          // 加载 mp4 转码
          let $mp4 = document.createElement('script')
          $mp4.src = 'https://upyun.luckly-mjw.cn/lib/mux-mp4.js'

          // 加载 vue
          let $vue = document.createElement('script')
          $vue.src = 'https://upyun.luckly-mjw.cn/lib/vue.js'

          // 加载 stream 流式下载器
          let $streamSaver = document.createElement('script')
          $streamSaver.src = 'https://upyun.luckly-mjw.cn/lib/stream-saver.js'

          // 监听 vue 加载完成，执行业务代码
          $vue.addEventListener('load', () => {${script}})
          document.body.appendChild($mp4);
          document.body.appendChild($ase);
          document.body.appendChild($streamSaver);
          document.body.appendChild($vue);
          alert('注入成功，请滚动到页面底部，若白屏则等待资源加载')
          `;
                        this.copyToClipboard(codeStr);
                        this.tips = '复制成功，打开视频网页控制台，注入本代码';
                    },
                    fail: () => {
                        this.alertError('链接不正确，请查看链接是否有效');
                    },
                })
            }
        },

        // 拷贝剪切板
        copyToClipboard(content) {
            clearTimeout(this.timeouter)

            if (!document.queryCommandSupported('copy')) {
                return false
            }

            let $input = document.createElement('textarea')
            $input.style.opacity = '0'
            $input.value = content
            document.body.appendChild($input)
            $input.select()

            const result = document.execCommand('copy')
            document.body.removeChild($input)
            $input = null

            return result
        },
    }
})