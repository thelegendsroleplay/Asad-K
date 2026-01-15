<?php

namespace Drupal\my_print_module\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;

/**
 * Class PrintController.
 *
 * Handles the custom print page functionality.
 */
class PrintController extends ControllerBase
{

    /**
     * Renders the printable version of a node.
     *
     * @param int $node
     *   The Node ID.
     *
     * @return array
     *   A render array for the print page.
     */
    public function printPage($node)
    {
        $node = Node::load($node);

        if ($node) {
            return [
                '#theme' => 'print_page',
                '#title' => $node->getTitle(),
                '#content' => $node->body->value ?? '',
                '#attached' => [
                    'library' => ['my_print_module/print_styles'],
                ],
            ];
        }

        return [
            '#markup' => $this->t('Node not found.'),
        ];
    }
}
