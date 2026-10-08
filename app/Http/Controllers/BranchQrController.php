<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BranchQrController extends Controller
{
    public function __invoke(Request $request, Branch $branch): Response
    {
        abort_unless($request->user()->canAccessBranch($branch), 404);

        $publicUrl = url('/usaha/'.$branch->business->slug.'?branch='.$branch->id);
        $renderer = new ImageRenderer(new RendererStyle(480, 4), new SvgImageBackEnd);
        $svg = (new Writer($renderer))->writeString($publicUrl);
        $filename = 'antrein-'.$branch->slug.'-qr.svg';
        $disposition = $request->boolean('download') ? 'attachment' : 'inline';

        return response($svg, 200, [
            'Content-Type' => 'image/svg+xml; charset=UTF-8',
            'Content-Disposition' => $disposition.'; filename="'.$filename.'"',
            'Cache-Control' => 'private, max-age=3600',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
