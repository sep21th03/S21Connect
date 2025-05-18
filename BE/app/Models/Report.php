<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;
    protected $fillable = [
        'reportable_type',
        'reportable_id',
        'reporter_id',
        'reason_code',
        'reason_text',
        'status',
        'admin_note',
    ];

    public function reportable()
    {
        return $this->morphTo();
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function getReasonDescriptionAttribute()
    {
        $type = $this->reportable_type;
        $code = $this->reason_code;

        return config("report_reasons.$type.$code", 'Unknown');
    }
}
