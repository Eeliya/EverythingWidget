<?php

namespace admin;

/**
 * Description of ContentsRepository
 *
 * @author Eeliya
 */
class ContentsRepository implements \ew\CRUDRepository {

  public function __construct() {
    require_once '/../models/ew_contents.php';
    require_once '/../models/ew_contents_labels.php';
  }

  public function create($input) {
    $result = new \stdClass;
    $result->error = 503;
    $result->message = 'ContentsRepository: REST create functionality is not implemented';

    $v = new \Valitron\Validator((array) $input);

    $v->rules([
        "required" => [
            ["title"], ["type"]
        ],
        "integer"  => "parent_id"
    ]);

    if (!$v->validate()) {
      $result->reason = $v->errors();
      return $result;
    }


    $content = new ew_contents;
    $content->author_id = $_SESSION['EW.USER_ID'];
    $content->fill((array) $input);
    $content->slug = \EWCore::to_slug($input->title, 'ew_contents');

    if (isset($content->content)) {
      $content_fields = $this->get_content_fields($content->content);
      $content->content_fields = $content_fields->content_fields;
      $content->parsed_content = $content_fields->html;
    }
    else {
      $content->content_fields = null;
      $content->parsed_content = null;
    }

    $content->date_created = date('Y-m-d H:i:s');
    $content->date_modified = date('Y-m-d H:i:s');
    $content->save();

    if ($content->id) {
      $labels = json_decode($input->labels, true);
      if (is_array($labels)) {
        foreach ($labels as $key => $value) {
          $this->update_label($content->id, $key, $value);
        }
      }
    }

    return $content;
  }

  public function delete($input) {
    $result = new \stdClass;
    //$result->error = 503;
    $result->message = 'Item has been deleted successfully';

    $content = ew_contents::find($input->id);

    $content->delete();

    return $result;
  }

  /**
   * 
   * @param type $input
   * @return mixed
   */
  public function read($input) {
    if (isset($input->id)) {
      return $this->find_by_id($input->id, $input->_language);
    }

    return $this->all($input->page, $input->page_size, $input->filter);
  }

  public function update($input) {
    if ($input->title === '') {
      $result = new \stdClass;
      $result->error = 400;
      $result->message = 'Content title can not be empty';

      return $result;
    }

    $content = ew_contents::find($input->id);
    $content->fill((array) $input);
    if (isset($content->content)) {
      $content_fields = $this->get_content_fields($content->content);
      $content->content_fields = $content_fields->content_fields;
      $content->parsed_content = $content_fields->html;
    }
    else {
      $content->content_fields = null;
      $content->parsed_content = null;
    }
    $content->save();

    return $content;
  }

  // ------ //

  private function get_content_labels($content_id, $key = '%') {
    if (preg_match('/\$content\.(\w*)/', $content_id))
      return [];
    if (!$key)
      $key = '%';
    $labels = \ew_contents_labels::where('content_id', '=', $content_id)->where('key', 'LIKE', $key)->get();
    return $labels->toArray();
  }

  private function parse_labels($labels, $data) {
    return array_map(function ($label) use ($data) {
      if (preg_match('/{@fields\/(.*)}/', $label['value'], $match) === 1) {
        if (isset($data['content_fields'][$match[1]])) {
          $label['value'] = $data['content_fields'][$match[1]]['content'];
        }
      }

      return $label;
    }, $labels);
  }

  public function all($page = 0, $page_size = 100, $filter = null) {
    if (is_null($page)) {
      $page = 0;
    }
    if (is_null($page_size)) {
      $page_size = 100;
    }

    $query = ew_contents::select();

    \ew\DBUtility::filter($query, $filter);

    $contents = $query->orderBy('title')->take($page_size)->skip($page * $page_size)->get(['*',
        \Illuminate\Database\Capsule\Manager::raw("DATE_FORMAT(date_created,'%Y-%m-%d') AS round_date_created")]);

//    $data = array_map(function($e) {
//      $e["content_fields"] = json_decode($e["content_fields"], true);
//      return $e;
//    }, $contents->toArray());

    $result = new \stdClass;

    $result->total = ew_contents::count();
    $result->page_size = intval($page_size);
    //$result->filter = $filter;
    $result->data = $contents;

    return $result;
  }

  public function find_by_id($id, $language = 'en') {
    $result = new \stdClass;

    if (!isset($id)) {
      $result->error = 400;
      $result->message = 'tr{Content Id is requird}';
      return $result;
    }

    $content = ew_contents::find($id, ['*',
                \Illuminate\Database\Capsule\Manager::raw("DATE_FORMAT(date_created,'%Y-%m-%d') AS round_date_created")]);

    if (isset($content)) {
      $labels = $this->get_content_labels($id);
      $content->labels = $labels;
      $content->labels = $this->parse_labels($labels, $content);

      $result->data = $content;

      return $result;
    }

    $result->error = 404;
    $result->message = 'Content not found';

    return $result;
  }

  public function update_label($content_id, $key, $value) {
    if (!$content_id) {
      \EWCore::log_error(400, 'tr{Content Id is requierd}');
    }

    $content = ew_contents::find($content_id)->toArray();

    $value = preg_replace_callback('/\$content\.(\w*)/', function($m) use ($content) {
      return $content[$m[1]];
    }, $value);

    $label = \ew_contents_labels::firstOrNew(['content_id' => $content_id,
                'key'        => $key]);

    if ($value) {
      $label->value = $value;
      $label->save();
    }
    else if ($label->exists) {
      $label->delete();
    }

    return json_encode(["status" => "success",
        "id"     => $label->id]);
  }

  private function get_node_link($node) {
    $link = null;
    if ($node->tagName === "a") {
      $link = $node->getAttribute("href");
    }

    return $link;
  }

  private function get_node_src($node) {
    $link = null;
    if ($node->tagName === "img") {
      $link = $node->getAttribute("src");
    }

    return $link;
  }

  private function get_content_fields($html) {
    $content_fields = new \stdClass();
    if (!isset($html) || $html === "") {
      return $content_fields;
    }
    $dom = new \DOMDocument;
    $dom->loadHTML('<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' . $html);
    $xpath = new \DOMXpath($dom);

    $fields = $xpath->query('//*[@content-field]');

    foreach ($fields as $field) {
      $children = $field->childNodes;
      $html = "";
      foreach ($children as $child) {
        $html .= $dom->saveHTML($child);
      }

      $current_field_value = $content_fields->{$field->getAttribute("content-field")};

      if ($field->getAttribute("content-field-hidden")) {

        $field->parentNode->removeChild($field);
      }

      if ($current_field_value) {
        if (is_array($current_field_value["content"])) {
          $link = $this->get_node_link($field);
          $field_value = $content_fields->{$field->getAttribute("content-field")};
          $field_value["content"][] = trim($html);

          $field_value["link"][] = $this->get_node_link($field);

          $field_value["src"][] = $this->get_node_src($field);
          $field_value["tag"][] = $field->tagName;
          $field_value["class"][] = $field->getAttribute("class");
          $field_value["alt"][] = $field->getAttribute("alt");

          $content_fields->{$field->getAttribute("content-field")} = $field_value;
        }
        else {
          $link = $this->get_node_link($field);
          $content_fields->{$field->getAttribute("content-field")} = ["content" => [
                  $current_field_value["content"],
                  trim($html)
              ], "link"    => [
                  $current_field_value["link"],
                  $this->get_node_link($field)
              ],
              "src"     => [
                  $current_field_value["src"],
                  $this->get_node_src($field)
              ],
              "tag"     => [
                  $current_field_value["tag"],
                  $field->tagName
              ],
              "class"   => [
                  $current_field_value["class"],
                  $field->getAttribute("class")
              ]
          ];
        }
      }
      else {
        $link = $this->get_node_link($field);
        $src = $this->get_node_src($field);
        $content_fields->{$field->getAttribute("content-field")} = ["content" => trim($html),
            "link"    => $link,
            "src"     => $src,
            "tag"     => $field->tagName,
            "class"   => $field->getAttribute("class"),
            "alt"     => $field->getAttribute("alt")
        ];
      }
    }

    $innerHTML = "";
    $elements = $dom->documentElement->getElementsByTagName('body');

    foreach ($elements as $element) {
      if ($element->nodeType !== XML_ELEMENT_NODE) {
        continue;
      }

      $children = $element->childNodes;

      foreach ($children as $child) {
        $innerHTML .= $dom->saveHTML($child);
      }
    }

    $result = new \stdClass();

    $result->html = $innerHTML;
    $result->content_fields = (array) $content_fields;

    return $result;
  }

}
