# services/slide_analyzer.py

from fastapi import HTTPException
from api.dependencies import gemini_model
from utils.pdf_utils import extract_text_and_font_size, analyze_font_metrics
from collections import defaultdict
import numpy as np

from prompts.load import load_prompt

class SlideAnalyzer:
    """Analyze slide content."""
    def __init__(self):
        self.content_categories = {
            "technical": "技術的な説明や実装の詳細",
            "background": "背景説明や課題提起",
            "methodology": "手法や解決アプローチの説明",
            "results": "結果や成果の説明",
            "conclusion": "まとめや今後の展望"
        }

    def analyze_slide(self, pdf_data: bytes) -> str:
        text_blocks = extract_text_and_font_size(pdf_data)
        font_sizes = [size for _, size in text_blocks]
        font_analysis = analyze_font_metrics(font_sizes)
        
        full_text = " ".join([text for text, _ in text_blocks])

        prompt = load_prompt(
            "analyze_precheck.txt",
            text=full_text
        )
        try:
            response = gemini_model.generate_content(prompt)
            if not "false" in response.text:
                raise HTTPException(
                    status_code=500,
                    detail=f"プロンプトインジェクションの可能性があるため、ブロックされました。",
                )

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Geminiエラー: {str(e)}")

        prompt = load_prompt(
            "analyze_slide.txt",
            font_analysis=font_analysis,
            full_text=full_text
        )

        try:
            response = gemini_model.generate_content(prompt)
            return response.text, font_analysis
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Geminiエラー: {str(e)}")
    
    async def compare(self, own_slide: bytes, ref_slides):
        """参照スライドとの比較分析"""
        current_analysis = self._get_structure(extract_text_and_font_size(own_slide))

        # 参照スライドの分析
        reference_analyses = [
            self._get_structure(extract_text_and_font_size(await ref.read())) for ref in ref_slides
        ]

        # 平均値の計算
        avg_distribution = defaultdict(float)
        for category in self.content_categories.keys():
            values = [
                analysis["content_distribution"][category] for analysis in reference_analyses
            ]
            avg_distribution[category] = np.mean(values)

        # 構造的特徴の比較
        structural_comparison = {
            "toc_ratio": sum(1 for ref in reference_analyses if ref["has_toc"]) / len(reference_analyses),
            "summary_ratio": sum(1 for ref in reference_analyses if ref["has_summary"]) / len(reference_analyses),
            "problem_statement_ratio": sum(1 for ref in reference_analyses if ref["has_problem_statement"]) / len(reference_analyses),
            "examples_ratio": sum(1 for ref in reference_analyses if ref["has_examples"]) / len(reference_analyses)
        }

        return {
            "current": current_analysis,
            "reference_avg": dict(avg_distribution),
            "structural_features": structural_comparison
        }
    
    def _get_structure(self, text_blocks):
        # 現在のスライドの分析
        """スライドの構造を抽出する"""
        structure = {
            "has_toc": False, # table of content
            "has_summary": False,
            "sections": [],
            "content_distribution": defaultdict(float)
        }

        combined_text = " ".join([block[0] for block in text_blocks])
        sections = self._split_into_sections(combined_text)

        section_analyses = []
        for section in sections:
            analysis = self._analyze_section_content(section)
            section_analyses.append(analysis)

        for category in self.content_categories.keys():
            values = [analysis[category] for analysis in section_analyses]
            structure["content_distribution"][category] = np.mean(values)

        structure.update(self._analyze_structural_features(combined_text))

        return structure

    def _split_into_sections(self, text, max_tokens=1000):
        """テキストをセクションに分割"""
        words = text.split()
        sections = []
        current_section = []
        current_token_count = 0

        for word in words:
            current_section.append(word)
            current_token_count += 1

            if current_token_count >= max_tokens:
                sections.append(" ".join(current_section))
                current_section = []
                current_token_count = 0

        if current_section:
            sections.append(" ".join(current_section))

        return sections

    def _analyze_section_content(self, text):
        """セクションの内容を分析する"""
        prompt = load_prompt(
            "analyze_section.txt",
            text=text
        )
        try:
            response = gemini_model.generate_content(prompt)
            result = {}
            for line in response.text.strip().split('\n'):
                category, percentage = line.split(':')
                result[category.strip()] = float(percentage.strip().replace('%', ''))

            return result
        except Exception as e:
            return {
                **{category: 0.0 for category in self.content_categories.keys()},  # content_categories の辞書を展開
                "error": f"コンテンツ分析中にエラーが発生しました: {str(e)}"
            }

    def _analyze_structural_features(self, text):
        """構造的特徴を分析"""
        prompt = load_prompt(
            "analyze_structure.txt",
            text=text
        )

        try:
            response = gemini_model.generate_content(prompt)
            result = {}
            for line in response.text.strip().split('\n'):
                feature, value = line.split(':')
                result[feature.strip()] = value.strip().lower() == 'true' 
            return result

        except Exception as e:
            return {
                "has_toc": False,
                "has_summary": False,
                "has_problem_statement": False,
                "has_examples": False,
                "error": f"コンテンツ分析中にエラーが発生しました: {str(e)}"
            }
    
    def get_comparison_feedback(self, comparison_results):
        """比較結果に基づくフィードバックを生成"""
        prompt = load_prompt(
            "analyze_comparison.txt",
            own_slide_content_distribution=self._format_content_distribution(
                comparison_results['current']['content_distribution']
            ),
            ref_slides_content_distribution=self._format_content_distribution(
                comparison_results['reference_avg']
            ),
            comparison_of_structure=self._format_structural_comparison(
                comparison_results['structural_features']
            )
        )

        response = gemini_model.generate_content(prompt)
        return response.text
    
    def _format_content_distribution(self, distribution):
        """コンテンツ分布のフォーマット"""
        return "\n".join([f"- {category}: {value:.1f}%" for category, value in distribution.items()])

    def _format_structural_comparison(self, comparison):
        """構造的特徴の比較結果のフォーマット"""
        return "\n".join([
            f"- {feature.replace('_ratio', '')}: {value*100:.0f}%の参照スライドが含む"
            for feature, value in comparison.items()
        ])