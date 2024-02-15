import { Schema, model } from 'mongoose';

const generalSettingSchema = new Schema(
    {
        siteTitle: { type: String, required: false, default: 'Passivo' },
        favIcon: { type: String, required: false, default: null },
        logo: { type: String, required: false, default: null },
    }, { timestamps: true, versionKey: false }
)

export default model('generalsettings', generalSettingSchema)