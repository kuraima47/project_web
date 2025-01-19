// pages/api/secret-config.js
exports.handler = async (req, res) => {
    // Valeur cryptée en hex par ex : "68656c6c6f2d66726f6d2d636f6e666967"
    // => "hello-from-config"
    // On pourrait le faire en base64, ou autre.

    res.status(200).json({
        config: {
            secretHex: '68656c6c6f2d66726f6d2d636f6e666967',
            note: 'Décrypte secretHex en ASCII ou utilise parseInt(...,16)',
        },
    });
}
