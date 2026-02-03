/**
 * @swagger
 * tags:
 *   - name: Journal
 *     description: Manajemen Jurnal Harian (CRUD, Upload Media, AI Analysis, & Chat)
 */

/**
 * @swagger
 * /api/v1/journals:
 *   post:
 *     summary: Membuat jurnal baru
 *     description: Upload video dan foto opsional. Analisis AI (emotion, expression, confidence) otomatis jika teks mencukupi.
 *     tags:
 *       - Journal
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Hari yang melelahkan"
 *               note:
 *                 type: string
 *                 example: "Hari ini banyak pikiran, tapi aku bertahan."
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Foto kenangan (.jpg/.png, max 50MB)
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Video ekspresi (.webm, max 50MB)
 *     responses:
 *       201:
 *         description: Jurnal berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     user_id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     note:
 *                       type: string
 *                     video_url:
 *                       type: string
 *                       nullable: true
 *                     photo_url:
 *                       type: string
 *                       nullable: true
 *                     image_path:
 *                       type: string
 *                       nullable: true
 *                     emotion:
 *                       type: string
 *                       nullable: true
 *                       example: "Sad"
 *                     expression:
 *                       type: string
 *                       nullable: true
 *                     confidence:
 *                       type: number
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validasi gagal (judul kosong)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Gagal upload file atau proses internal
 */

/**
 * @swagger
 * /api/v1/journals:
 *   get:
 *     summary: Mengambil daftar jurnal
 *     description: Mengambil jurnal user berdasarkan bulan & tahun (default bulan dan tahun saat ini)
 *     tags:
 *       - Journal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Filter bulan (1–12)
 *         example: 1
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter tahun
 *         example: 2026
 *     responses:
 *       200:
 *         description: List jurnal berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meta:
 *                   type: object
 *                   properties:
 *                     filter_month:
 *                       type: integer
 *                       example: 2
 *                     filter_year:
 *                       type: integer
 *                       example: 2026
 *                     days_in_month:
 *                       type: integer
 *                       example: 28
 *                     period_start:
 *                       type: string
 *                       format: date-time
 *                     period_end:
 *                       type: string
 *                       format: date-time
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       note:
 *                         type: string
 *                       emotion:
 *                         type: string
 *                         nullable: true
 *                       video_url:
 *                         type: string
 *                         nullable: true
 *                       photo_url:
 *                         type: string
 *                         nullable: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Gagal mengambil data jurnal
 */

/**
 * @swagger
 * /api/v1/journals/{id}:
 *   get:
 *     summary: Mengambil detail satu jurnal
 *     description: Mengambil detail lengkap jurnal milik user, termasuk hasil analisis AI jika tersedia
 *     tags:
 *       - Journal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID jurnal (UUID)
 *     responses:
 *       200:
 *         description: Detail jurnal ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     user_id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     note:
 *                       type: string
 *                     video_url:
 *                       type: string
 *                       nullable: true
 *                     photo_url:
 *                       type: string
 *                       nullable: true
 *                     image_path:
 *                       type: string
 *                       nullable: true
 *                     emotion:
 *                       type: string
 *                       nullable: true
 *                     expression:
 *                       type: string
 *                       nullable: true
 *                     confidence:
 *                       type: number
 *                       nullable: true
 *                     similarity:
 *                       type: number
 *                       nullable: true
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                       nullable: true
 *                     chatbot_suggestion:
 *                       type: string
 *                       nullable: true
 *                     chatbot_highlight:
 *                       type: string
 *                       nullable: true
 *                     chatbot_strategy:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       403:
 *         description: Tidak memiliki akses ke jurnal ini
 *       404:
 *         description: Jurnal tidak ditemukan
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/journals/{id}:
 *   put:
 *     summary: Mengupdate jurnal
 *     description: Mengubah judul, catatan, dan/atau mengganti foto jurnal. Jika upload foto baru, foto lama akan dihapus dari storage.
 *     tags:
 *       - Journal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID jurnal (UUID)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Judul jurnal diperbarui"
 *               note:
 *                 type: string
 *                 example: "Isi jurnal setelah diedit"
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Foto baru (opsional, akan menggantikan foto lama)
 *     responses:
 *       200:
 *         description: Jurnal berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     note:
 *                       type: string
 *                     photo_url:
 *                       type: string
 *                       nullable: true
 *                     image_path:
 *                       type: string
 *                       nullable: true
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       403:
 *         description: Tidak memiliki akses untuk mengedit jurnal
 *       404:
 *         description: Jurnal tidak ditemukan
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Gagal update foto atau error internal
 */

/**
 * @swagger
 * /api/v1/journals/{id}:
 *   delete:
 *     summary: Menghapus jurnal
 *     description: Menghapus jurnal beserta file video dan/atau foto yang tersimpan di storage.
 *     tags:
 *       - Journal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID jurnal (UUID)
 *     responses:
 *       200:
 *         description: Jurnal berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Jurnal dan file terkait berhasil dihapus"
 *       403:
 *         description: Tidak memiliki akses untuk menghapus jurnal
 *       404:
 *         description: Jurnal tidak ditemukan
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Gagal menghapus file atau error internal
 */

/**
 * @swagger
 * /api/v1/journals/enhance:
 *   post:
 *     summary: Meminta AI memperbaiki atau mengembangkan teks jurnal
 *     description: AI dapat memperbaiki grammar, melakukan parafrase, atau mengembangkan teks jurnal.
 *     tags:
 *       - Journal
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: "aku cape banget hari ini kerjaan numpuk"
 *               instruction:
 *                 type: string
 *                 enum: [fix_grammar, paraphrase, elaboration]
 *                 description: Jenis instruksi AI (opsional)
 *     responses:
 *       200:
 *         description: Teks berhasil diproses oleh AI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 original_text:
 *                   type: string
 *                 enhanced_text:
 *                   type: string
 *                 instruction:
 *                   type: string
 *       400:
 *         description: Field text tidak diisi
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Layanan AI tidak tersedia atau gagal memproses permintaan
 */

/**
 * @swagger
 * /api/v1/journals/{id}/chat:
 *   post:
 *     summary: Chat AI dengan konteks jurnal
 *     description: AI berperan sebagai asisten empatik/psikolog berdasarkan isi jurnal user.
 *     tags:
 *       - Journal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID jurnal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Kenapa aku merasa sedih banget di tulisan ini?"
 *     responses:
 *       200:
 *         description: Balasan AI berdasarkan konteks jurnal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 journal_id:
 *                   type: string
 *                 question:
 *                   type: string
 *                 reply:
 *                   type: string
 *       400:
 *         description: Pesan pertanyaan tidak diisi
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Jurnal tidak ditemukan atau bukan milik user
 *       500:
 *         description: Layanan AI gagal memproses permintaan
 */

/**
 * @swagger
 * /api/v1/journals/{id}/analyze:
 *   post:
 *     summary: Memicu analisis mendalam (Deep Insight)
 *     description: Menghasilkan Tags, Suggestion, Strategy, dan Highlight dari AI, lalu menyimpannya ke database.
 *     tags:
 *       - Journal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analisis berhasil, data jurnal diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                     chatbot_strategy:
 *                       type: string
 *                     chatbot_suggestion:
 *                       type: string
 */

/**
 * @swagger
 * /api/v1/journals/mood-calendar:
 *   get:
 *     summary: Mengambil data kalender mood
 *     description: Digunakan untuk visualisasi kalender emosi bulanan di Frontend.
 *     tags:
 *       - Journal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Bulan (1-12). Default bulan saat ini.
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           example: 2026
 *         description: Tahun. Default tahun saat ini.
 *     responses:
 *       200:
 *         description: Data mood per tanggal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 year:
 *                   type: integer
 *                 month:
 *                   type: integer
 *                 moods:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       emotion:
 *                         type: string
 *                       expression:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */